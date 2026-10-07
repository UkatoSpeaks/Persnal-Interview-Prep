import type { KeyboardEvent } from 'react'
import { cn } from '../../lib/cn'

export interface TabItem<T extends string = string> {
  id: T
  label: string
}

interface TabsProps<T extends string> {
  tabs: TabItem<T>[]
  value: T
  onChange: (id: T) => void
  className?: string
}

/** Controlled tab strip. The caller renders the panel for the current `value`. */
export default function Tabs<T extends string>({ tabs, value, onChange, className }: TabsProps<T>) {
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    event.preventDefault()
    const step = event.key === 'ArrowRight' ? 1 : -1
    const current = tabs.findIndex((tab) => tab.id === value)
    const next = (current + step + tabs.length) % tabs.length
    onChange(tabs[next].id)
    const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')
    buttons[next]?.focus()
  }

  return (
    <div
      role="tablist"
      onKeyDown={onKeyDown}
      className={cn('flex gap-6 border-b border-line', className)}
    >
      {tabs.map((tab) => {
        const selected = tab.id === value
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={cn(
              '-mb-px border-b-2 pb-2 text-sm font-medium transition-colors',
              selected
                ? 'border-accent text-ink'
                : 'border-transparent text-muted hover:text-ink',
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
