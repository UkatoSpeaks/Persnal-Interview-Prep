import type { Confidence, LastVisited, Progress } from '../types'
import { scheduleReview } from './review'

const PREFIX = 'prepagent:'

const KEYS = {
  progress: `${PREFIX}progress`,
} as const

const EMPTY_PROGRESS: Progress = {
  bookmarks: [],
  confidence: {},
  notes: {},
  practiceHistory: [],
  reviews: {},
}

// localStorage can throw (private mode, quota, blocked site data), so every
// access goes through these and falls back instead of crashing the app.
function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Nothing useful to do; the value just won't persist.
  }
}

// Progress is read from localStorage once and then kept in memory, so reads
// are free and every component sees the same object. Updates replace it with
// a new object (never mutate), which is what lets useProgress detect changes.
let cached: Progress | null = null
const listeners = new Set<() => void>()

export function getProgress(): Progress {
  cached ??= { ...EMPTY_PROGRESS, ...read<Partial<Progress>>(KEYS.progress, {}) }
  return cached
}

export function saveProgress(progress: Progress): void {
  cached = progress
  write(KEYS.progress, progress)
  listeners.forEach((listener) => listener())
}

/** For useProgress. Returns the unsubscribe function. */
export function subscribeProgress(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Pass null to clear the rating. */
export function setConfidence(questionId: string, confidence: Confidence | null): void {
  const next = { ...getProgress().confidence }
  if (confidence) next[questionId] = confidence
  else delete next[questionId]
  saveProgress({ ...getProgress(), confidence: next })
}

/**
 * A rating given in Practice: sets the same confidence the question pages
 * use, and schedules the question's next review.
 */
export function rateQuestion(questionId: string, confidence: Confidence): void {
  const progress = getProgress()
  saveProgress({
    ...progress,
    confidence: { ...progress.confidence, [questionId]: confidence },
    reviews: {
      ...progress.reviews,
      [questionId]: scheduleReview(progress.reviews[questionId], confidence, new Date()),
    },
  })
}

export function setTypeAnswerFirst(typeAnswerFirst: boolean): void {
  saveProgress({ ...getProgress(), typeAnswerFirst })
}

export function toggleBookmark(questionId: string): void {
  const { bookmarks } = getProgress()
  saveProgress({
    ...getProgress(),
    bookmarks: bookmarks.includes(questionId)
      ? bookmarks.filter((id) => id !== questionId)
      : [...bookmarks, questionId],
  })
}

/** An empty note removes the entry. */
export function setNote(questionId: string, note: string): void {
  const next = { ...getProgress().notes }
  if (note) next[questionId] = note
  else delete next[questionId]
  saveProgress({ ...getProgress(), notes: next })
}

export function setLastVisited(lastVisited: LastVisited): void {
  if (getProgress().lastVisited?.path === lastVisited.path) return
  saveProgress({ ...getProgress(), lastVisited })
}
