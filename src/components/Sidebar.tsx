import { NavLink } from 'react-router-dom'
import {
  BrainCircuit,
  FolderKanban,
  LayoutDashboard,
  MessagesSquare,
  Settings,
  Target,
  type LucideIcon,
} from 'lucide-react'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/concepts', label: 'Concepts', icon: BrainCircuit },
  { to: '/practice', label: 'Practice', icon: Target },
  { to: '/mock-interview', label: 'Mock Interview', icon: MessagesSquare },
  { to: '/settings', label: 'Settings', icon: Settings },
]

interface SidebarProps {
  /** Called after a link is clicked, so the mobile drawer can close. */
  onNavigate?: () => void
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <div className="flex h-full w-60 flex-col border-r border-line bg-surface">
      <div className="flex h-14 items-center px-5 text-sm font-semibold tracking-tight">
        PrepAgent
      </div>
      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group flex h-9 items-center gap-3 rounded-control px-3 text-sm transition-colors ${
                isActive
                  ? 'bg-subtle font-medium text-ink'
                  : 'text-muted hover:bg-subtle hover:text-ink'
              }`
            }
          >
            <Icon
              className="size-4 shrink-0 transition-colors group-aria-[current=page]:text-accent"
              aria-hidden
            />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
