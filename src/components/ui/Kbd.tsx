import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'

export default function Kbd({ className, ...props }: ComponentProps<'kbd'>) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded border border-line bg-subtle px-1 font-mono text-xs text-muted',
        className,
      )}
      {...props}
    />
  )
}
