export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Question {
  /** Unique across all content and stable once in use, e.g. "rag-chunking-1". */
  id: string
  question: string
  /** Markdown, written the way I would say it in an interview. */
  answer: string
  difficulty: Difficulty
  tags: string[]
  /** Likely follow-up questions from the interviewer. */
  followUps: string[]
}

export type ProjectStatus = 'live' | 'in-progress' | 'completed'

export interface KeyDecision {
  decision: string
  why: string
  alternatives: string
}

export interface Challenge {
  problem: string
  solution: string
}

export interface Project {
  id: string
  name: string
  tagline: string
  status: ProjectStatus
  techStack: string[]
  links: { github?: string; live?: string }
  /** Markdown. */
  overview: string
  /** Markdown; can include a simple text diagram of the flow. */
  architecture: string
  keyDecisions: KeyDecision[]
  challenges: Challenge[]
  metrics?: string[]
  questions: Question[]
}

/** In display order. */
export const CONCEPT_CATEGORIES = [
  'ML Fundamentals',
  'Deep Learning',
  'Transformers & Attention',
  'LLMs',
  'Embeddings & Vector DBs',
  'RAG',
  'Prompt Engineering',
  'Agents & Tool Calling',
  'LangChain / LangGraph',
  'Fine-tuning',
  'LLM Evaluation',
  'LLMOps & Deployment',
  'System Design for AI Apps',
  'Backend',
  'Frontend',
] as const

export type ConceptCategory = (typeof CONCEPT_CATEGORIES)[number]

export interface Concept {
  id: string
  title: string
  category: ConceptCategory
  /** Markdown. */
  summary: string
  keyPoints: string[]
  questions: Question[]
  relatedConceptIds: string[]
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
