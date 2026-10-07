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
    <div className="flex h-full w-60 flex-col border-r border-zinc-800 bg-zinc-950">
      <div className="flex h-14 items-center px-5 text-sm font-semibold tracking-tight">
        PrepAgent
      </div>
      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-zinc-800 text-zinc-50'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
              }`
            }
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
