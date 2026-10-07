import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrainCircuit, CircleHelp, FolderKanban, Search, type LucideIcon } from 'lucide-react'
import { concepts, projects } from '../data'
import { cn } from '../lib/cn'
import { withoutTodo } from '../lib/content'
import Kbd from './ui/Kbd'

type Kind = 'Projects' | 'Concepts' | 'Questions'

interface Entry {
  key: string
  kind: Kind
  title: string
  subtitle: string
  to: string
  /** Lowercased text that matches rank highest on. */
  primary: string
  /** Lowercased text of everything searchable. */
  haystack: string
}

const KINDS: { kind: Kind; icon: LucideIcon; limit: number }[] = [
  { kind: 'Projects', icon: FolderKanban, limit: 5 },
  { kind: 'Concepts', icon: BrainCircuit, limit: 6 },
  { kind: 'Questions', icon: CircleHelp, limit: 12 },
]

function entry(fields: Omit<Entry, 'primary' | 'haystack'>, extra: string[]): Entry {
  const primary = fields.title.toLowerCase()
  return { ...fields, primary, haystack: [primary, fields.subtitle, ...extra].join(' ').toLowerCase() }
}

// Built once when the module loads. The content is static, so there is
// nothing to keep in sync.
const ENTRIES: Entry[] = [
  ...projects.flatMap((project) => [
    entry(
      {
        key: project.id,
        kind: 'Projects',
        title: project.name,
        subtitle: withoutTodo(project.tagline),
        to: `/projects/${project.id}`,
      },
      project.techStack,
    ),
    ...project.questions.map((question) =>
      entry(
        {
          key: question.id,
          kind: 'Questions',
          title: question.question,
          subtitle: project.name,
          to: `/projects/${project.id}?tab=questions#${question.id}`,
        },
        [...question.tags, question.answer],
      ),
    ),
  ]),
  ...concepts.flatMap((concept) => [
    entry(
      {
        key: concept.id,
        kind: 'Concepts',
        title: concept.title,
        subtitle: concept.category,
        to: `/concepts/${concept.id}`,
      },
      [concept.summary, ...concept.keyPoints],
    ),
    ...concept.questions.map((question) =>
      entry(
        {
          key: question.id,
          kind: 'Questions',
          title: question.question,
          subtitle: concept.title,
          to: `/concepts/${concept.id}#${question.id}`,
        },
        [...question.tags, question.answer],
      ),
    ),
  ]),
]

/** Every word must appear somewhere; title matches come first. Grouped by kind. */
function search(query: string): Entry[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (terms.length === 0) return []

  const matches = ENTRIES.filter((item) => terms.every((term) => item.haystack.includes(term)))
  const inTitle = (item: Entry) => terms.every((term) => item.primary.includes(term))

  return KINDS.flatMap(({ kind, limit }) => {
    const ofKind = matches.filter((item) => item.kind === kind)
    return [...ofKind.filter(inTitle), ...ofKind.filter((item) => !inTitle(item))].slice(0, limit)
  })
}

interface CommandPaletteProps {
  onClose: () => void
}

/** Mounted only while open, so its state resets every time. */
export default function CommandPalette({ onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const navigate = useNavigate()
  const listRef = useRef<HTMLDivElement>(null)

  const results = useMemo(() => search(query), [query])

  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const go = (item: Entry) => {
    onClose()
    navigate(item.to)
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose()
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (results.length === 0) return
      const step = event.key === 'ArrowDown' ? 1 : -1
      setActive((current) => (current + step + results.length) % results.length)
    } else if (event.key === 'Enter' && results[active]) {
      event.preventDefault()
      go(results[active])
    }
  }

  return (
    <div className="fixed inset-0 z-50 px-4" role="dialog" aria-modal="true" aria-label="Search">
      <div className="absolute inset-0 bg-ink/20" onClick={onClose} />
      <div
        className="relative mx-auto mt-[12vh] flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-card border border-line bg-surface"
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="size-4 shrink-0 text-muted" aria-hidden />
          <input
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setActive(0)
            }}
            placeholder="Search projects, concepts and questions"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls="command-palette-results"
            aria-autocomplete="list"
            spellCheck={false}
            className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
          />
          <Kbd>Esc</Kbd>
        </div>

        <div ref={listRef} id="command-palette-results" role="listbox" className="overflow-y-auto">
          {query.trim() === '' ? (
            <p className="px-4 py-8 text-center text-sm text-muted">
              Type to search. Use the arrow keys and Enter to open a result.
            </p>
          ) : results.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted">Nothing matches "{query}".</p>
          ) : (
            <div className="p-2">
              {results.map((item, index) => {
                const { icon: Icon } = KINDS.find(({ kind }) => kind === item.kind)!
                const startsGroup = index === 0 || results[index - 1].kind !== item.kind
                return (
                  <div key={item.key}>
                    {startsGroup && (
                      <p className="px-2 pt-2 pb-1 text-xs font-medium text-muted">
                        {item.kind}
                      </p>
                    )}
                    <button
                      type="button"
                      role="option"
                      aria-selected={index === active}
                      tabIndex={-1}
                      onClick={() => go(item)}
                      onMouseMove={() => setActive(index)}
                      className={cn(
                        'flex w-full items-start gap-3 rounded-control px-2 py-2 text-left text-sm',
                        index === active && 'bg-subtle',
                      )}
                    >
                      <Icon
                        className={cn(
                          'mt-0.5 size-4 shrink-0',
                          index === active ? 'text-accent' : 'text-muted',
                        )}
                        aria-hidden
                      />
                      <span className="min-w-0">
                        <span className="block">{item.title}</span>
                        {item.subtitle && (
                          <span className="block truncate text-xs text-muted">{item.subtitle}</span>
                        )}
                      </span>
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
