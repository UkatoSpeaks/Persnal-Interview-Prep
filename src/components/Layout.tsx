import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import Sidebar from './Sidebar'

export default function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const closeDrawer = () => setDrawerOpen(false)

  return (
    <div className="flex h-dvh overflow-hidden">
      <aside className="hidden md:block">
        <Sidebar />
      </aside>

      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <motion.div
              className="absolute inset-0 bg-black/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={closeDrawer}
            />
            <motion.aside
              className="absolute inset-y-0 left-0"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <Sidebar onNavigate={closeDrawer} />
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Close menu"
                className="absolute right-3 top-3.5 rounded-md p-1 text-zinc-400 hover:text-zinc-100"
              >
                <X className="size-5" />
              </button>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-zinc-800 px-4 md:hidden">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="rounded-md p-1 text-zinc-400 hover:text-zinc-100"
          >
            <Menu className="size-5" />
          </button>
          <span className="text-sm font-semibold tracking-tight">PrepAgent</span>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
