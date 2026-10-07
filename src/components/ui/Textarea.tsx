import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'
import { FIELD_CLASSES } from './Input'

export default function Textarea({ className, rows = 4, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      rows={rows}
      className={cn(FIELD_CLASSES, 'block resize-y py-2 leading-6', className)}
      {...props}
    />
  )
}
