import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, SearchX } from 'lucide-react'
import ProjectStatusBadge from '../components/ProjectStatusBadge'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Input from '../components/ui/Input'
import { projects } from '../data'
import { needsContent, withoutTodo } from '../lib/content'

export default function Projects() {
  const [query, setQuery] = useState('')

  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  const visible = projects.filter((project) => {
    const text = [project.name, project.tagline, ...project.techStack].join(' ').toLowerCase()
    return terms.every((term) => text.includes(term))
  })

  return (
    <section>
      <h1 className="text-xl">Projects</h1>
      <p className="mt-1 text-sm text-muted">
        What I built, why I built it that way, and the questions it invites.
      </p>

      <div className="relative mt-8 max-w-sm">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter by name or tech"
          aria-label="Filter projects"
          className="pl-9"
        />
      </div>

      {visible.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={SearchX}
          title="No projects match"
          description={`Nothing matches "${query}". Try a project name or a technology.`}
        />
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((project) => {
            const tagline = withoutTodo(project.tagline)
            return (
              <Link key={project.id} to={`/projects/${project.id}`} className="rounded-card">
                <Card interactive className="flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-base">{project.name}</h2>
                    <ProjectStatusBadge status={project.status} />
                  </div>
                  {tagline && <p className="mt-1 text-sm text-muted">{tagline}</p>}

                  <div className="mt-auto flex flex-wrap gap-1.5 pt-6">
                    {project.techStack.map((tech) => (
                      <Badge key={tech}>{tech}</Badge>
                    ))}
                    {needsContent(project) && (
                      <Badge className="border-dashed bg-transparent">Needs content</Badge>
                    )}
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}
