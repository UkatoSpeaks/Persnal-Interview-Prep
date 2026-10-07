import { concepts, projects, questions } from '../data'
import { CONCEPT_CATEGORIES, type Confidence, type Progress, type Question } from '../types'
import { categorySlug } from './content'
import { isDue } from './review'

/**
 * Where a session's questions come from, as one string so it can be a
 * <select> value: a filter below, "project:<id>" or "category:<slug>".
 */
export type Source = string

export const DEFAULT_LIMIT = 10

export const SOURCE_FILTERS: { value: Source; label: string }[] = [
  { value: 'all', label: 'All questions' },
  { value: 'bookmarked', label: 'Bookmarked' },
  { value: 'weak', label: 'Weak only' },
  { value: 'weak-shaky', label: 'Weak or shaky' },
]

export const SOURCE_PROJECTS: { value: Source; label: string }[] = projects.map((project) => ({
  value: `project:${project.id}`,
  label: project.name,
}))

/** Only categories that have content. */
export const SOURCE_CATEGORIES: { value: Source; label: string }[] = CONCEPT_CATEGORIES.filter(
  (category) => concepts.some((concept) => concept.category === category),
).map((category) => ({ value: `category:${categorySlug(category)}`, label: category }))

const SOURCES = new Set(
  [...SOURCE_FILTERS, ...SOURCE_PROJECTS, ...SOURCE_CATEGORIES].map((option) => option.value),
)

/** Reads ?project=<id>, ?category=<slug> or ?filter=<filter>; anything else is "all". */
export function sourceFromParams(params: URLSearchParams): Source {
  const candidates = [
    `project:${params.get('project')}`,
    `category:${params.get('category')}`,
    params.get('filter') ?? '',
  ]
  return candidates.find((candidate) => SOURCES.has(candidate)) ?? 'all'
}

/** Writes the source into the params, replacing whichever one was there. */
export function setSourceParam(params: URLSearchParams, source: Source): void {
  params.delete('filter')
  params.delete('project')
  params.delete('category')
  const [kind, id] = source.split(':')
  if (id !== undefined) params.set(kind, id)
  else if (source !== 'all') params.set('filter', source)
}

/** Reads ?limit=<n> or ?limit=all (null, no limit). */
export function limitFromParams(params: URLSearchParams): number | null {
  const raw = params.get('limit')
  if (raw === 'all') return null
  const limit = Number(raw)
  return Number.isInteger(limit) && limit > 0 ? limit : DEFAULT_LIMIT
}

function questionsFor(source: Source, progress: Progress): Question[] {
  const [kind, id] = source.split(':')
  if (kind === 'project') return projects.find((project) => project.id === id)?.questions ?? []
  if (kind === 'category') {
    return concepts
      .filter((concept) => categorySlug(concept.category) === id)
      .flatMap((concept) => concept.questions)
  }
  switch (source) {
    case 'bookmarked':
      return questions.filter((question) => progress.bookmarks.includes(question.id))
    case 'weak':
      return questions.filter((question) => progress.confidence[question.id] === 'weak')
    case 'weak-shaky':
      return questions.filter((question) => {
        const confidence = progress.confidence[question.id]
        return confidence === 'weak' || confidence === 'shaky'
      })
    default:
      return questions
  }
}

function shuffled<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/** Among questions never practised: weak first, confident last. */
const UNPRACTISED_ORDER: Record<Confidence | 'unrated', number> = {
  weak: 0,
  shaky: 1,
  unrated: 2,
  confident: 3,
}

/**
 * The questions for one session, in order: due for review first (most overdue
 * first), then ones never practised (shuffled), then ones scheduled for later
 * (soonest first).
 */
export function buildSession(
  source: Source,
  limit: number | null,
  progress: Progress,
  now: number,
): Question[] {
  const due: Question[] = []
  const unpractised: Question[] = []
  const later: Question[] = []
  for (const question of questionsFor(source, progress)) {
    const review = progress.reviews[question.id]
    if (!review) unpractised.push(question)
    else if (isDue(review, now)) due.push(question)
    else later.push(question)
  }

  const byNextReview = (a: Question, b: Question) =>
    progress.reviews[a.id].nextReview.localeCompare(progress.reviews[b.id].nextReview)
  const rank = (question: Question) =>
    UNPRACTISED_ORDER[progress.confidence[question.id] ?? 'unrated']

  const ordered = [
    ...due.sort(byNextReview),
    ...shuffled(unpractised).sort((a, b) => rank(a) - rank(b)),
    ...later.sort(byNextReview),
  ]
  return limit === null ? ordered : ordered.slice(0, limit)
}

const QUESTIONS_BY_ID = new Map(questions.map((question) => [question.id, question]))

export function questionsById(ids: string[]): Question[] {
  return ids.flatMap((id) => QUESTIONS_BY_ID.get(id) ?? [])
}

/** The project or concept a question belongs to. */
export interface Topic {
  label: string
  to: string
}

const TOPICS = new Map<string, Topic>()
for (const project of projects) {
  const topic = { label: project.name, to: `/projects/${project.id}?tab=questions` }
  for (const question of project.questions) TOPICS.set(question.id, topic)
}
for (const concept of concepts) {
  const topic = { label: concept.title, to: `/concepts/${concept.id}` }
  for (const question of concept.questions) TOPICS.set(question.id, topic)
}

export function topicOf(questionId: string): Topic | undefined {
  return TOPICS.get(questionId)
}
