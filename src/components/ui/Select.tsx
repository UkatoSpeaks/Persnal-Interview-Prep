import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'
import { FIELD_CLASSES } from './Input'

/** A native select with the field look. Pass <option> / <optgroup> children. */
export default function Select({ className, ...props }: ComponentProps<'select'>) {
  return <select className={cn(FIELD_CLASSES, 'h-9 pr-2', className)} {...props} />
}
