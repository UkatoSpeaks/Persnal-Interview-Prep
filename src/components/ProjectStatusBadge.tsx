import type { ProjectStatus } from '../types'
import Badge from './ui/Badge'

const LABELS: Record<ProjectStatus, string> = {
  live: 'Live',
  'in-progress': 'In progress',
  completed: 'Completed',
}

/** Live gets the accent; the status colors are reserved for confidence. */
export default function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return <Badge tone={status === 'live' ? 'accent' : 'neutral'}>{LABELS[status]}</Badge>
}
