import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { buttonClasses } from '../components/ui/Button'
import Card from '../components/ui/Card'
import { questions } from '../data'
import { countConfidence } from '../lib/content'
import { countDue } from '../lib/review'
import { useProgress } from '../lib/useProgress'

const REVIEW_COUNT = 10

const QUESTION_IDS = new Set(questions.map((question) => question.id))

function Stat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Card>
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-2 text-xl font-semibold tracking-tight tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted">{detail}</p>
    </Card>
  )
}

export default function Dashboard() {
  const progress = useProgress((value) => value)
  const counts = countConfidence(questions, progress.confidence)
  const rated = counts.confident + counts.shaky + counts.weak
  // Only bookmarks that still point at a question.
  const bookmarked = progress.bookmarks.filter((id) => QUESTION_IDS.has(id)).length
  const { lastVisited } = progress
  const due = countDue(questions, progress.reviews, Date.now())

  return (
    <section>
      <h1 className="text-xl">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">Your prep progress at a glance.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          label="Total questions"
          value={String(counts.total)}
          detail={`${rated} rated so far`}
        />
        <Stat
          label="Confident"
          value={`${Math.round(counts.percentConfident)}%`}
          detail={`${counts.confident} of ${counts.total} questions`}
        />
        <Stat label="Weak" value={String(counts.weak)} detail={`${counts.shaky} shaky`} />
        <Stat label="Bookmarked" value={String(bookmarked)} detail="Saved to revisit" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Link
          to={lastVisited?.path ?? '/concepts'}
          className="rounded-card lg:col-span-2"
        >
          <Card interactive className="flex h-full items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted">Continue where you left off</p>
              <p className="mt-2 truncate text-base font-semibold tracking-tight">
                {lastVisited?.title ?? 'Start with Concepts'}
              </p>
              <p className="mt-1 text-xs text-muted">
                {lastVisited
                  ? lastVisited.kind === 'project'
                    ? 'Project'
                    : 'Concept'
                  : 'Nothing opened yet'}
              </p>
            </div>
            <ArrowRight className="size-4 shrink-0 text-muted" aria-hidden />
          </Card>
        </Link>

        <Card className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted">Due for review</p>
            <p className="mt-2 text-xl font-semibold tracking-tight tabular-nums">{due}</p>
            <p className="mt-1 text-xs text-muted">
              {due === 0 ? 'Nothing scheduled right now' : 'They come first in a practice session'}
            </p>
          </div>
          <Link to="/practice" className={buttonClasses(due === 0 ? 'outline' : 'primary')}>
            Practice
          </Link>
        </Card>

        <Card className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted">Weak spots</p>
            <p className="mt-2 text-sm">
              {counts.weak === 0
                ? 'No questions marked weak yet. Rate a few as you go.'
                : `${counts.weak} question${counts.weak === 1 ? '' : 's'} marked weak.`}
            </p>
          </div>
          <Link
            to={`/practice?filter=weak&limit=${REVIEW_COUNT}`}
            className={buttonClasses('outline')}
          >
            Review {REVIEW_COUNT} weak questions
          </Link>
        </Card>
      </div>
    </section>
  )
}
