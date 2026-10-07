import { CONCEPT_CATEGORIES, type Concept, type Project, type Question } from '../types'
import * as conceptModules from './concepts'
import * as projectModules from './projects'

// Every export of projects/index.ts is one Project, and every export of
// concepts/index.ts is one category's Concept[]. Collecting them here is what
// lets new content be just a new file plus one export line.
export const projects: Project[] = Object.values(projectModules).sort((a, b) =>
  a.name.localeCompare(b.name),
)

/** Grouped by category in CONCEPT_CATEGORIES order; file order within a category. */
export const concepts: Concept[] = Object.values(conceptModules)
  .flat()
  .sort((a, b) => CONCEPT_CATEGORIES.indexOf(a.category) - CONCEPT_CATEGORIES.indexOf(b.category))

/** Every question from every project and concept. */
export const questions: Question[] = [...projects, ...concepts].flatMap((item) => item.questions)
