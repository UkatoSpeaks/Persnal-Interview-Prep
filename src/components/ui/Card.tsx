import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'

interface CardProps extends ComponentProps<'div'> {
  /** For clickable cards: adds the hover border and soft shadow. */
  interactive?: boolean
}

export default function Card({ interactive = false, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-card border border-line bg-surface p-6',
        interactive && 'transition-[border-color,box-shadow] hover:border-line-strong hover:shadow-hover',
        className,
      )}
      {...props}
    />
  )
}
