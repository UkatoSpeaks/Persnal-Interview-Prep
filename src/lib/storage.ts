import type { Progress } from '../types'

const PREFIX = 'prepagent:'

const KEYS = {
  apiKey: `${PREFIX}groq-api-key`,
  progress: `${PREFIX}progress`,
} as const

const EMPTY_PROGRESS: Progress = {
  bookmarks: [],
  confidence: {},
  notes: {},
  practiceHistory: [],
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

function remove(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // Same as write: nothing useful to do.
  }
}

/** The Groq key entered on the Settings page, or '' if none is saved. */
export function getApiKey(): string {
  return read(KEYS.apiKey, '')
}

export function setApiKey(apiKey: string): void {
  write(KEYS.apiKey, apiKey.trim())
}

export function clearApiKey(): void {
  remove(KEYS.apiKey)
}

export function getProgress(): Progress {
  return { ...EMPTY_PROGRESS, ...read<Partial<Progress>>(KEYS.progress, {}) }
}

export function saveProgress(progress: Progress): void {
  write(KEYS.progress, progress)
}
