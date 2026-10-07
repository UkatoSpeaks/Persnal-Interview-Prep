import type { Confidence, Progress, Question, Review } from '../types'

const MINUTE = 60_000
const DAY = 24 * 60 * MINUTE

/** Weak comes back within the same sitting. */
const WEAK_DELAY = 10 * MINUTE
const SHAKY_DAYS = 2
/** Confident starts here and doubles on every confident rating in a row. */
const CONFIDENT_FIRST_DAYS = 7
const CONFIDENT_MAX_DAYS = 90
const HISTORY_LIMIT = 8

/** The review state after rating a question now. */
export function scheduleReview(
  previous: Review | undefined,
  confidence: Confidence,
  now: Date,
): Review {
  const intervalDays =
    confidence === 'weak'
      ? 0
      : confidence === 'shaky'
        ? SHAKY_DAYS
        : Math.min(
            CONFIDENT_MAX_DAYS,
            Math.max(CONFIDENT_FIRST_DAYS, (previous?.intervalDays ?? 0) * 2),
          )
  const delay = intervalDays === 0 ? WEAK_DELAY : intervalDays * DAY

  return {
    nextReview: new Date(now.getTime() + delay).toISOString(),
    intervalDays,
    history: [
      ...(previous?.history ?? []),
      { ratedAt: now.toISOString(), confidence },
    ].slice(-HISTORY_LIMIT),
  }
}

/** A question never rated in Practice has no review and is not due. */
export function isDue(review: Review | undefined, now: number): boolean {
  return review !== undefined && Date.parse(review.nextReview) <= now
}

/** Counts these questions only, so stale ids in storage are ignored. */
export function countDue(questions: Question[], reviews: Progress['reviews'], now: number): number {
  return questions.filter((question) => isDue(reviews[question.id], now)).length
}
