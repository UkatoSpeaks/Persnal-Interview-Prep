import { useId, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { cn } from '../../lib/cn'

interface CollapsibleProps {
  title: ReactNode
  defaultOpen?: boolean
  children: ReactNode
  className?: string
}

export default function Collapsible({
  title,
  defaultOpen = false,
  children,
  className,
}: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen)
  const panelId = useId()

  return (
    <div className={cn('rounded-card border border-line bg-surface', className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-2 rounded-card px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-subtle"
      >
        <ChevronRight
          className={cn('size-4 shrink-0 text-muted transition-transform', open && 'rotate-90')}
          aria-hidden
        />
        {title}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            className="overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            <div className="border-t border-line px-4 py-4 text-sm">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
