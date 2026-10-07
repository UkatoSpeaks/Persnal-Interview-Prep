import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import QuestionList from '../components/QuestionList'
import { buttonClasses } from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Markdown from '../components/ui/Markdown'
import { concepts } from '../data'
import { categorySlug } from '../lib/content'
import { setLastVisited } from '../lib/storage'

export default function ConceptDetail() {
  const { conceptId } = useParams()
  const concept = concepts.find((item) => item.id === conceptId)

  useEffect(() => {
    if (concept) {
      setLastVisited({ path: `/concepts/${concept.id}`, title: concept.title, kind: 'concept' })
    }
  }, [concept])

  if (!concept) {
    return (
      <EmptyState
        title="Concept not found"
        description="It may have been renamed or removed."
        action={
          <Link to="/concepts" className={buttonClasses('outline', 'sm')}>
            All concepts
          </Link>
        }
      />
    )
  }

  const related = concept.relatedConceptIds.flatMap(
    (id) => concepts.find((item) => item.id === id) ?? [],
  )

  return (
    <article className="max-w-reading">
      <Link
        to={`/concepts?category=${categorySlug(concept.category)}`}
        className="inline-flex items-center gap-1.5 rounded-control text-sm text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {concept.category}
      </Link>

      <h1 className="mt-4 text-xl">{concept.title}</h1>
      <Markdown className="mt-4">{concept.summary}</Markdown>

      {concept.keyPoints.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg">Key points</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-7 marker:text-muted">
            {concept.keyPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-lg">Questions</h2>
        <p className="mt-1 mb-4 text-sm text-muted">
          Answer out loud first, then open the question to check yourself.
        </p>
        <QuestionList questions={concept.questions} />
      </section>

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg">Related concepts</h2>
          <ul className="mt-4 divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
            {related.map((item) => (
              <li key={item.id}>
                <Link
                  to={`/concepts/${item.id}`}
                  className="group flex items-center justify-between gap-3 px-4 py-3 text-sm transition-colors hover:bg-subtle focus-visible:outline-offset-[-2px]"
                >
                  <span className="min-w-0">
                    <span className="block font-medium">{item.title}</span>
                    <span className="block text-xs text-muted">{item.category}</span>
                  </span>
                  <ArrowRight
                    className="size-4 shrink-0 text-muted transition-colors group-hover:text-ink"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}
