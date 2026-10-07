export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Project {
  id: string
  name: string
  summary: string
  techStack: string[]
}

export interface Concept {
  id: string
  title: string
  category: string
  summary: string
}

export interface Question {
  id: string
  prompt: string
  category: string
  difficulty: Difficulty
  answer?: string
  /** Set when the question is about a specific project or concept. */
  projectId?: string
  conceptId?: string
}

/** 1 = no idea, 5 = could answer it in my sleep. */
export type Confidence = 1 | 2 | 3 | 4 | 5

export interface PracticeEntry {
  questionId: string
  /** ISO timestamp */
  practicedAt: string
  confidence?: Confidence
}

/** Everything the user generates; persisted in localStorage. Keyed by content id. */
export interface Progress {
  bookmarks: string[]
  confidence: Record<string, Confidence>
  notes: Record<string, string>
  practiceHistory: PracticeEntry[]
}
