import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'

type Tone = 'neutral' | 'accent' | 'confident' | 'shaky' | 'weak'

const TONES: Record<Tone, string> = {
  neutral: 'border-line bg-subtle text-muted',
  accent: 'border-accent/20 bg-accent-soft text-accent',
  confident: 'border-confident-line bg-confident-soft text-confident-ink',
  shaky: 'border-shaky-line bg-shaky-soft text-shaky-ink',
  weak: 'border-weak-line bg-weak-soft text-weak-ink',
}

interface BadgeProps extends ComponentProps<'span'> {
  tone?: Tone
}

export default function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-control border px-2 py-0.5 text-xs font-medium',
        TONES[tone],
        className,
      )}
      {...props}
    />
  )
}
