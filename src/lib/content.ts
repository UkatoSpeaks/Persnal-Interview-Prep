import type { ConceptCategory, Progress, Project, Question } from '../types'

/** Placeholder text in content that has not been written yet. */
const TODO_MARKER = 'TODO: fill from README'

export function isTodo(text: string): boolean {
  return text.includes(TODO_MARKER)
}

/** The text with the placeholder removed, for display. May be empty. */
export function withoutTodo(text: string): string {
  return text.replace(TODO_MARKER, '').trim()
}

export function needsContent(project: Project): boolean {
  return isTodo(project.overview)
}

/** "Embeddings & Vector DBs" -> "embeddings-vector-dbs", for URLs. */
export function categorySlug(category: ConceptCategory): string {
  return category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export interface ConfidenceCounts {
  total: number
  confident: number
  shaky: number
  weak: number
  /** 0 to 100. */
  percentConfident: number
}

/** Counts ratings for these questions only, so stale ids in storage are ignored. */
export function countConfidence(
  questions: Question[],
  confidence: Progress['confidence'],
): ConfidenceCounts {
  const counts = { total: questions.length, confident: 0, shaky: 0, weak: 0 }
  for (const question of questions) {
    const rating = confidence[question.id]
    if (rating) counts[rating] += 1
  }
  return {
    ...counts,
    percentConfident: counts.total === 0 ? 0 : (counts.confident / counts.total) * 100,
  }
}
