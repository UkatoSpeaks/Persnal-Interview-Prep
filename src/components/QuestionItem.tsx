import { memo, useEffect, useId, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import type { Question } from '../types'
import { setConfidence, setNote } from '../lib/storage'
import { useProgress } from '../lib/useProgress'
import BookmarkButton from './BookmarkButton'
import Badge from './ui/Badge'
import Collapsible from './ui/Collapsible'
import Markdown from './ui/Markdown'
import Textarea from './ui/Textarea'
import ConfidencePicker from './ConfidencePicker'

const CONFIDENCE_LABELS = { weak: 'Weak', shaky: 'Shaky', confident: 'Confident' } as const

function Notes({ questionId }: { questionId: string }) {
  const note = useProgress((progress) => progress.notes[questionId] ?? '')
  const [preview, setPreview] = useState(false)
  const fieldId = useId()

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor={fieldId} className="text-xs font-medium">
          My notes
        </label>
        {note && (
          <button
            type="button"
            onClick={() => setPreview((value) => !value)}
            className="rounded-control text-xs text-muted transition-colors hover:text-ink"
          >
            {preview ? 'Edit' : 'Preview'}
          </button>
        )}
      </div>
      {preview && note ? (
        <Markdown className="rounded-control border border-line bg-canvas px-3 py-2 text-sm">
          {note}
        </Markdown>
      ) : (
        <Textarea
          id={fieldId}
          rows={3}
          value={note}
          onChange={(event) => setNote(questionId, event.target.value)}
          placeholder="What to remember next time. Markdown works."
        />
      )}
    </div>
  )
}

interface QuestionItemProps {
  question: Question
}

/**
 * One question, collapsed by default so the answer stays hidden until asked
 * for. Confidence, bookmark and notes are saved per question id.
 */
function QuestionItem({ question }: QuestionItemProps) {
  const confidence = useProgress((progress) => progress.confidence[question.id])

  // Search results link to "#<question id>": bring that question into view and
  // focus it, but leave the answer hidden.
  const { hash } = useLocation()
  const targeted = hash === `#${question.id}`
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!targeted) return
    ref.current?.scrollIntoView({ block: 'center' })
    ref.current?.querySelector('button')?.focus({ preventScroll: true })
  }, [targeted])

  return (
    <div ref={ref} id={question.id}>
      <Collapsible
        title={
          <span className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <span className="min-w-0">{question.question}</span>
            <span className="flex shrink-0 items-center gap-2">
              {confidence && <Badge tone={confidence}>{CONFIDENCE_LABELS[confidence]}</Badge>}
              <span className="text-xs font-normal text-muted">{question.difficulty}</span>
            </span>
          </span>
        }
        actions={<BookmarkButton questionId={question.id} />}
      >
        <Markdown>{question.answer}</Markdown>

        {question.followUps.length > 0 && (
          <div className="mt-6">
            <h4 className="text-xs font-medium text-muted">Likely follow-ups</h4>
            <ul className="mt-2 list-disc space-y-1 pl-5 marker:text-muted">
              {question.followUps.map((followUp) => (
                <li key={followUp}>{followUp}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 space-y-4 border-t border-line pt-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium">How did that go?</span>
            <ConfidencePicker
              value={confidence}
              onChange={(value) => setConfidence(question.id, value)}
            />
          </div>
          <Notes questionId={question.id} />
        </div>
      </Collapsible>
    </div>
  )
}

export default memo(QuestionItem)
