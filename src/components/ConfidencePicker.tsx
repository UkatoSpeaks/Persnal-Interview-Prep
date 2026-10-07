import type { Confidence } from '../types'
import { cn } from '../lib/cn'

const OPTIONS: { value: Confidence; label: string; selected: string }[] = [
  { value: 'weak', label: 'Weak', selected: 'border-weak-line bg-weak-soft text-weak-ink' },
  { value: 'shaky', label: 'Shaky', selected: 'border-shaky-line bg-shaky-soft text-shaky-ink' },
  {
    value: 'confident',
    label: 'Confident',
    selected: 'border-confident-line bg-confident-soft text-confident-ink',
  },
]

interface ConfidencePickerProps {
  value: Confidence | undefined
  /** Called with null when the selected option is clicked again, to clear it. */
  onChange: (value: Confidence | null) => void
}

export default function ConfidencePicker({ value, onChange }: ConfidencePickerProps) {
  return (
    <div role="group" aria-label="Confidence" className="inline-flex gap-1.5">
      {OPTIONS.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(selected ? null : option.value)}
            className={cn(
              'h-8 rounded-control border px-3 text-xs font-medium transition-colors',
              selected
                ? option.selected
                : 'border-line bg-surface text-muted hover:border-line-strong hover:text-ink',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
