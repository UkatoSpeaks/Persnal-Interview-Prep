import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Search, X } from 'lucide-react'
import Sidebar from './Sidebar'

// Lazy, so the search index (all the content) stays out of the entry chunk.
const CommandPalette = lazy(() => import('./CommandPalette'))

const ICON_BUTTON =
  'rounded-control p-1.5 text-muted transition-colors hover:bg-subtle hover:text-ink'

export default function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const closeDrawer = () => setDrawerOpen(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { pathname, hash } = useLocation()

  const openSearch = () => {
    setDrawerOpen(false)
    setSearchOpen(true)
  }

  // Cmd/Ctrl+K toggles the command palette from anywhere.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setDrawerOpen(false)
        setSearchOpen((open) => !open)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // <main> is the scroll container, so the browser won't reset it between
  // pages. A link with a hash scrolls to its own target instead.
  const mainRef = useRef<HTMLElement>(null)
  useEffect(() => {
    if (!hash) mainRef.current?.scrollTo(0, 0)
  }, [pathname, hash])

  return (
    <div className="flex h-dvh overflow-hidden">
      <aside className="hidden md:block">
        <Sidebar onSearch={openSearch} />
      </aside>

      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <motion.div
              className="absolute inset-0 bg-ink/20"
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
              <Sidebar onNavigate={closeDrawer} onSearch={openSearch} />
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Close menu"
                className={`absolute right-3 top-3 ${ICON_BUTTON}`}
              >
                <X className="size-5" />
              </button>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line bg-surface px-3 md:hidden">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className={ICON_BUTTON}
          >
            <Menu className="size-5" />
          </button>
          <span className="flex-1 text-sm font-semibold tracking-tight">PrepAgent</span>
          <button type="button" onClick={openSearch} aria-label="Search" className={ICON_BUTTON}>
            <Search className="size-5" />
          </button>
        </header>

        <main ref={mainRef} className="flex-1 overflow-y-auto">
          <motion.div
            key={pathname}
            className="mx-auto max-w-5xl px-4 py-8 md:px-10 md:py-12"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            <Suspense fallback={<p className="text-sm text-muted">Loading...</p>}>
              <Outlet />
            </Suspense>
          </motion.div>
        </main>
      </div>

      {searchOpen && (
        <Suspense fallback={null}>
          <CommandPalette onClose={() => setSearchOpen(false)} />
        </Suspense>
      )}
    </div>
  )
}
