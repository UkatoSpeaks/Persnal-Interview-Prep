import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Layers } from 'lucide-react'
import BookmarkButton from '../components/BookmarkButton'
import Button, { buttonClasses } from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Kbd from '../components/ui/Kbd'
import Markdown from '../components/ui/Markdown'
import ProgressBar from '../components/ui/ProgressBar'
import Select from '../components/ui/Select'
import Textarea from '../components/ui/Textarea'
import { cn } from '../lib/cn'
import {
  DEFAULT_LIMIT,
  SOURCE_CATEGORIES,
  SOURCE_FILTERS,
  SOURCE_PROJECTS,
  buildSession,
  limitFromParams,
  questionsById,
  setSourceParam,
  sourceFromParams,
  topicOf,
  type Source,
  type Topic,
} from '../lib/practice'
import { getProgress, rateQuestion, setTypeAnswerFirst } from '../lib/storage'
import { useProgress } from '../lib/useProgress'
import type { Confidence, Question } from '../types'

const RATINGS: { value: Confidence; label: string; key: string; tone: string; hover: string }[] = [
  {
    value: 'weak',
    label: 'Weak',
    key: '1',
    tone: 'border-weak-line bg-weak-soft text-weak-ink',
    hover: 'hover:border-weak',
  },
  {
    value: 'shaky',
    label: 'Shaky',
    key: '2',
    tone: 'border-shaky-line bg-shaky-soft text-shaky-ink',
    hover: 'hover:border-shaky',
  },
  {
    value: 'confident',
    label: 'Confident',
    key: '3',
    tone: 'border-confident-line bg-confident-soft text-confident-ink',
    hover: 'hover:border-confident',
  },
]

const LIMITS = [10, 20, 50]

const SECTION_LABEL = 'text-xs font-medium text-muted'

interface FlashcardProps {
  question: Question
  typeFirst: boolean
  revealed: boolean
  onReveal: () => void
  onRate: (confidence: Confidence) => void
}

/** Keyed by question id, so the typed answer starts empty on every card. */
function Flashcard({ question, typeFirst, revealed, onReveal, onRate }: FlashcardProps) {
  const [typed, setTyped] = useState('')
  const topic = topicOf(question.id)
  const myAnswer = typed.trim()

  return (
    <Card className="md:p-8">
      <div className="flex items-center justify-between gap-4">
        <p className="min-w-0 truncate text-xs text-muted">
          {topic ? `${topic.label} · ${question.difficulty}` : question.difficulty}
        </p>
        <BookmarkButton questionId={question.id} />
      </div>
      <h2 className="mt-3 text-lg">{question.question}</h2>

      {!revealed ? (
        <>
          {typeFirst && (
            <Textarea
              autoFocus
              rows={7}
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) onReveal()
              }}
              aria-label="My answer"
              placeholder="Answer the way you would say it in the interview."
              className="mt-6"
            />
          )}
          <div className="mt-6 flex items-center gap-3">
            <Button onClick={onReveal}>Reveal</Button>
            <span className="flex items-center gap-1">
              {typeFirst ? (
                <>
                  <Kbd>Ctrl</Kbd>
                  <Kbd>Enter</Kbd>
                </>
              ) : (
                <Kbd>Space</Kbd>
              )}
            </span>
          </div>
        </>
      ) : (
        <>
          <div
            className={cn('mt-6 border-t border-line pt-6', myAnswer && 'grid gap-8 lg:grid-cols-2')}
          >
            {myAnswer && (
              <div className="min-w-0">
                <h3 className={SECTION_LABEL}>My answer</h3>
                <p className="mt-3 text-base leading-7 whitespace-pre-wrap">{myAnswer}</p>
                {/* "Evaluate with AI" goes here: it has the typed answer and the question. */}
              </div>
            )}
            <div className="min-w-0">
              {myAnswer && <h3 className={cn(SECTION_LABEL, 'mb-3')}>Reference answer</h3>}
              <Markdown>{question.answer}</Markdown>

              {question.followUps.length > 0 && (
                <div className="mt-6">
                  <h3 className={SECTION_LABEL}>Likely follow-ups</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 marker:text-muted">
                    {question.followUps.map((followUp) => (
                      <li key={followUp}>{followUp}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 border-t border-line pt-6">
            <p className="text-xs font-medium">How did that go?</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {RATINGS.map((rating) => (
                <button
                  key={rating.value}
                  type="button"
                  onClick={() => onRate(rating.value)}
                  className={cn(
                    'flex h-9 items-center justify-center gap-2 rounded-control border text-sm font-medium transition-colors',
                    rating.tone,
                    rating.hover,
                  )}
                >
                  {rating.label}
                  <Kbd className="hidden sm:inline-flex">{rating.key}</Kbd>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </Card>
  )
}

interface SummaryProps {
  queue: Question[]
  ratings: Confidence[]
  onRetry: (ids: string[]) => void
  onRestart: () => void
}

function Summary({ queue, ratings, onRetry, onRestart }: SummaryProps) {
  const weakIds = queue.filter((_, index) => ratings[index] === 'weak').map(({ id }) => id)

  // Topics with anything short of confident, worst first.
  const byTopic = new Map<Topic, { weak: number; shaky: number }>()
  queue.forEach((question, index) => {
    const topic = topicOf(question.id)
    const rating = ratings[index]
    if (!topic || rating === 'confident') return
    const counts = byTopic.get(topic) ?? { weak: 0, shaky: 0 }
    counts[rating] += 1
    byTopic.set(topic, counts)
  })
  const weakest = [...byTopic]
    .sort(([, a], [, b]) => b.weak * 2 + b.shaky - (a.weak * 2 + a.shaky))
    .slice(0, 3)

  return (
    <Card className="md:p-8">
      <h2 className="text-lg">Session complete</h2>
      <p className="mt-1 text-sm text-muted">
        {queue.length} question{queue.length === 1 ? '' : 's'} practised.
      </p>

      <div className="mt-6 grid grid-cols-3 gap-2">
        {RATINGS.map((rating) => (
          <div key={rating.value} className={cn('rounded-control border px-4 py-3', rating.tone)}>
            <p className="text-lg font-semibold tracking-tight tabular-nums">
              {ratings.filter((value) => value === rating.value).length}
            </p>
            <p className="text-xs">{rating.label}</p>
          </div>
        ))}
      </div>

      {weakest.length > 0 && (
        <div className="mt-8">
          <h3 className={SECTION_LABEL}>Weakest topics</h3>
          <ul className="mt-2 divide-y divide-line">
            {weakest.map(([topic, counts]) => (
              <li key={topic.to} className="flex items-center justify-between gap-4 py-2">
                <Link
                  to={topic.to}
                  className="min-w-0 truncate rounded-control font-medium transition-colors hover:text-accent"
                >
                  {topic.label}
                </Link>
                <span className="shrink-0 text-xs text-muted">
                  {[counts.weak && `${counts.weak} weak`, counts.shaky && `${counts.shaky} shaky`]
                    .filter(Boolean)
                    .join(', ')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-2">
        {weakIds.length > 0 && (
          <Button onClick={() => onRetry(weakIds)}>Practice weak ones again</Button>
        )}
        <Button variant={weakIds.length > 0 ? 'outline' : 'primary'} onClick={onRestart}>
          New session
        </Button>
        <Link to="/" className={buttonClasses('ghost')}>
          Back to dashboard
        </Link>
      </div>
    </Card>
  )
}

interface SessionProps {
  source: Source
  limit: number | null
  /** Set for "Practice weak ones again": exactly these questions, in this order. */
  retryIds?: string[]
  typeFirst: boolean
  onRetry: (ids: string[]) => void
  onRestart: () => void
}

/**
 * One run through a fixed list of questions. The parent remounts it (by key)
 * to start another, so the list is built once and ratings given during the
 * session don't reshuffle it.
 */
function Session({ source, limit, retryIds, typeFirst, onRetry, onRestart }: SessionProps) {
  const [queue] = useState(() =>
    retryIds ? questionsById(retryIds) : buildSession(source, limit, getProgress(), Date.now()),
  )
  // One rating per question answered so far, in queue order.
  const [ratings, setRatings] = useState<Confidence[]>([])
  const [revealed, setRevealed] = useState(false)
  const current: Question | undefined = queue[ratings.length]

  const rate = (confidence: Confidence) => {
    if (!current) return
    rateQuestion(current.id, confidence)
    setRatings((previous) => [...previous, confidence])
    setRevealed(false)
  }

  // Space reveals, then 1 / 2 / 3 rate. Left alone while typing or in a dialog
  // (the command palette), and Space is left to whatever button has focus.
  useEffect(() => {
    if (!current) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target instanceof Element ? event.target : null
      if (target?.closest('input, textarea, select, [role="dialog"]')) return

      if (!revealed) {
        if (event.key === ' ' && !target?.closest('button, a')) {
          event.preventDefault()
          setRevealed(true)
        }
        return
      }
      const rating = RATINGS.find(({ key }) => key === event.key)
      if (rating) rate(rating.value)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  // Each new card starts at the top, even after a long answer.
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (ratings.length > 0) ref.current?.closest('main')?.scrollTo(0, 0)
  }, [ratings.length])

  if (queue.length === 0) {
    return (
      <EmptyState
        icon={Layers}
        title="Nothing to practise here"
        description="No questions match this source yet. Pick another one above."
      />
    )
  }

  if (!current) {
    return (
      <div ref={ref}>
        <Summary queue={queue} ratings={ratings} onRetry={onRetry} onRestart={onRestart} />
      </div>
    )
  }

  const position = `${ratings.length + 1} / ${queue.length}`

  return (
    <div ref={ref}>
      <div className="mb-4 flex items-center gap-4">
        <span className="shrink-0 text-xs text-muted tabular-nums">
          {retryIds ? `Weak ones again · ${position}` : position}
        </span>
        <ProgressBar
          label="Session progress"
          hideLabel
          value={(ratings.length / queue.length) * 100}
          className="flex-1"
        />
      </div>
      <Flashcard
        key={current.id}
        question={current}
        typeFirst={typeFirst}
        revealed={revealed}
        onReveal={() => setRevealed(true)}
        onRate={rate}
      />
    </div>
  )
}

export default function Practice() {
  const [params, setParams] = useSearchParams()
  const source = sourceFromParams(params)
  const limit = limitFromParams(params)
  const typeFirst = useProgress((progress) => progress.typeAnswerFirst ?? false)

  // A new session starts whenever the URL (source, limit) or the run changes.
  // A retry belongs to the URL it started from, so changing the source drops it.
  const search = params.toString()
  const [run, setRun] = useState(0)
  const [retry, setRetry] = useState<{ search: string; ids: string[] } | null>(null)
  const retryIds = retry?.search === search ? retry.ids : undefined

  const updateParams = (change: (next: URLSearchParams) => void) => {
    const next = new URLSearchParams(params)
    change(next)
    setParams(next, { replace: true })
  }

  const limits = limit === null || LIMITS.includes(limit) ? LIMITS : [...LIMITS, limit].sort((a, b) => a - b)

  return (
    // Wider when typing first, to fit the two answers side by side.
    <section className={cn(!typeFirst && 'max-w-reading')}>
      <h1 className="text-xl">Practice</h1>

      <div className="mt-6 mb-10 flex flex-wrap items-center gap-x-3 gap-y-3">
        <Select
          aria-label="Questions from"
          value={source}
          onChange={(event) => updateParams((next) => setSourceParam(next, event.target.value))}
          className="w-auto max-w-full"
        >
          {SOURCE_FILTERS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
          <optgroup label="Projects">
            {SOURCE_PROJECTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </optgroup>
          <optgroup label="Concepts">
            {SOURCE_CATEGORIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </optgroup>
        </Select>

        <Select
          aria-label="Session length"
          value={limit ?? 'all'}
          onChange={(event) =>
            updateParams((next) => {
              if (event.target.value === String(DEFAULT_LIMIT)) next.delete('limit')
              else next.set('limit', event.target.value)
            })
          }
          className="w-auto"
        >
          {limits.map((value) => (
            <option key={value} value={value}>
              {value} questions
            </option>
          ))}
          <option value="all">No limit</option>
        </Select>

        <label className="flex h-9 items-center gap-2 text-sm text-muted sm:ml-auto">
          <input
            type="checkbox"
            checked={typeFirst}
            onChange={(event) => setTypeAnswerFirst(event.target.checked)}
            className="size-4 accent-accent"
          />
          Type my answer first
        </label>
      </div>

      <Session
        key={`${search}|${run}`}
        source={source}
        limit={limit}
        retryIds={retryIds}
        typeFirst={typeFirst}
        onRetry={(ids) => {
          setRetry({ search, ids })
          setRun((value) => value + 1)
        }}
        onRestart={() => {
          setRetry(null)
          setRun((value) => value + 1)
        }}
      />
    </section>
  )
}
