import { Link, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import ProgressBar from '../components/ui/ProgressBar'
import { concepts } from '../data'
import { cn } from '../lib/cn'
import { categorySlug, countConfidence } from '../lib/content'
import { useProgress } from '../lib/useProgress'
import { CONCEPT_CATEGORIES } from '../types'

// Static, so grouped once. Categories with no concepts yet are left out.
const CATEGORIES = CONCEPT_CATEGORIES.map((name) => {
  const items = concepts.filter((concept) => concept.category === name)
  return {
    name,
    slug: categorySlug(name),
    concepts: items,
    questions: items.flatMap((concept) => concept.questions),
  }
}).filter((category) => category.concepts.length > 0)

export default function Concepts() {
  const confidence = useProgress((progress) => progress.confidence)

  // The open category lives in the URL, so Back from a concept returns to it.
  const [searchParams, setSearchParams] = useSearchParams()
  const openSlug = searchParams.get('category')

  return (
    <section className="max-w-reading">
      <h1 className="text-xl">Concepts</h1>
      <p className="mt-1 text-sm text-muted">
        Pick a category. The bar shows how many of its questions you have marked confident.
      </p>

      <div className="mt-8 divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
        {CATEGORIES.map((category) => {
          const open = category.slug === openSlug
          const counts = countConfidence(category.questions, confidence)
          const panelId = `category-${category.slug}`

          return (
            <div key={category.slug}>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() =>
                  setSearchParams(open ? {} : { category: category.slug }, { replace: true })
                }
                className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-subtle focus-visible:outline-offset-[-2px]"
              >
                <ChevronRight
                  className={cn(
                    'size-4 shrink-0 text-muted transition-transform',
                    open && 'rotate-90',
                  )}
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{category.name}</span>
                  <span className="block text-xs text-muted">
                    {category.concepts.length} concepts, {category.questions.length} questions
                  </span>
                </span>
                <span className="flex w-28 shrink-0 items-center gap-3 sm:w-44">
                  <ProgressBar
                    className="flex-1"
                    value={counts.percentConfident}
                    label={`${category.name}: questions marked confident`}
                    tone="confident"
                    hideLabel
                  />
                  <span className="w-9 text-right text-xs text-muted tabular-nums">
                    {Math.round(counts.percentConfident)}%
                  </span>
                </span>
              </button>

              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    id={panelId}
                    className="overflow-hidden"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                  >
                    <ul className="border-t border-line bg-canvas px-4 py-2">
                      {category.concepts.map((concept) => {
                        const own = countConfidence(concept.questions, confidence)
                        return (
                          <li key={concept.id}>
                            <Link
                              to={`/concepts/${concept.id}`}
                              className="flex items-center justify-between gap-3 rounded-control px-3 py-2 text-sm transition-colors hover:bg-subtle focus-visible:outline-offset-[-2px]"
                            >
                              <span className="min-w-0">{concept.title}</span>
                              <span className="shrink-0 text-xs text-muted tabular-nums">
                                {own.confident}/{own.total} confident
                              </span>
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </section>
  )
}
