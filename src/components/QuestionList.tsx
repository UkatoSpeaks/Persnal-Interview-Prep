import type { Question } from '../types'
import EmptyState from './ui/EmptyState'
import QuestionItem from './QuestionItem'

interface QuestionListProps {
  questions: Question[]
  /** Shown when there are no questions. */
  emptyDescription?: string
}

export default function QuestionList({ questions, emptyDescription }: QuestionListProps) {
  if (questions.length === 0) {
    return <EmptyState title="No questions yet" description={emptyDescription} />
  }

  return (
    <div className="space-y-3">
      {questions.map((question) => (
        <QuestionItem key={question.id} question={question} />
      ))}
    </div>
  )
}
