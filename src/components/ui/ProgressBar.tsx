import { cn } from '../../lib/cn'

type Tone = 'accent' | 'confident' | 'shaky' | 'weak'

const TONES: Record<Tone, string> = {
  accent: 'bg-accent',
  confident: 'bg-confident',
  shaky: 'bg-shaky',
  weak: 'bg-weak',
}

interface ProgressBarProps {
  /** 0 to 100. */
  value: number
  /** Accessible name; also shown above the bar with the percentage. */
  label: string
  tone?: Tone
  hideLabel?: boolean
  className?: string
}

export default function ProgressBar({
  value,
  label,
  tone = 'accent',
  hideLabel = false,
  className,
}: ProgressBarProps) {
  const percent = Math.round(Math.min(100, Math.max(0, value)))

  return (
    <div className={className}>
      {!hideLabel && (
        <div className="mb-2 flex items-baseline justify-between text-xs">
          <span className="font-medium">{label}</span>
          <span className="text-muted tabular-nums">{percent}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-1.5 overflow-hidden rounded-full bg-line"
      >
        <div
          className={cn('h-full rounded-full transition-[width]', TONES[tone])}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
