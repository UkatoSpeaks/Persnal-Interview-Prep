import { concepts, projects, questions } from './index'

/**
 * Problems in the content files that TypeScript cannot catch. Progress in
 * localStorage is keyed by id, so a duplicated id makes two items share
 * bookmarks, confidence and notes.
 */
export function findContentIssues(): string[] {
  const issues: string[] = []

  const seen = new Map<string, string>()
  const claim = (id: string, label: string) => {
    const previous = seen.get(id)
    if (previous) issues.push(`Duplicate id "${id}": ${previous} and ${label}`)
    else seen.set(id, label)
  }

  for (const project of projects) claim(project.id, `project "${project.name}"`)
  for (const concept of concepts) claim(concept.id, `concept "${concept.title}"`)
  for (const item of [...projects, ...concepts]) {
    const owner = 'name' in item ? item.name : item.title
    for (const question of item.questions) claim(question.id, `question in "${owner}"`)
  }

  const conceptIds = new Set(concepts.map((concept) => concept.id))
  for (const concept of concepts) {
    for (const relatedId of concept.relatedConceptIds) {
      if (!conceptIds.has(relatedId)) {
        issues.push(`Concept "${concept.id}" has unknown relatedConceptId "${relatedId}"`)
      }
    }
  }

  return issues
}

/** Dev-only: called from main.tsx, never in a production build. */
export function warnOnContentIssues(): void {
  const issues = findContentIssues()
  if (issues.length === 0) return
  console.warn(
    `[PrepAgent] ${issues.length} content issue(s) in src/data (${questions.length} questions checked):\n` +
      issues.map((issue) => `  - ${issue}`).join('\n'),
  )
}
