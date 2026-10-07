import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'

/** Shared by Input and Textarea. */
export const FIELD_CLASSES =
  'w-full rounded-control border border-line bg-surface px-3 text-sm text-ink transition-colors ' +
  'placeholder:text-muted hover:border-line-strong focus-visible:border-accent focus-visible:outline-offset-[-1px] ' +
  'disabled:pointer-events-none disabled:bg-subtle disabled:text-muted'

export default function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(FIELD_CLASSES, 'h-9', className)} {...props} />
}
