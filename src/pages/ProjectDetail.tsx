import { useEffect } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import ProjectStatusBadge from '../components/ProjectStatusBadge'
import QuestionList from '../components/QuestionList'
import Badge from '../components/ui/Badge'
import { buttonClasses } from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Markdown from '../components/ui/Markdown'
import Tabs, { type TabItem } from '../components/ui/Tabs'
import { projects } from '../data'
import { isTodo, needsContent, withoutTodo } from '../lib/content'
import { setLastVisited } from '../lib/storage'
import type { Project } from '../types'

type TabId = 'overview' | 'architecture' | 'decisions' | 'challenges' | 'questions'

const TABS: TabItem<TabId>[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'decisions', label: 'Decisions' },
  { id: 'challenges', label: 'Challenges' },
  { id: 'questions', label: 'Questions' },
]

function NotWritten({ project, what }: { project: Project; what: string }) {
  return (
    <EmptyState
      title={`No ${what} yet`}
      description={`Add it in src/data/projects/${project.id}.ts.`}
    />
  )
}

function LabelledText({ label, children }: { label: string; children: string }) {
  return (
    <div className="mt-4">
      <h4 className="text-xs font-medium text-muted">{label}</h4>
      <p className="mt-1 text-sm leading-6">{children}</p>
    </div>
  )
}

function Overview({ project }: { project: Project }) {
  return (
    <div className="space-y-8">
      {isTodo(project.overview) ? (
        <NotWritten project={project} what="overview" />
      ) : (
        <Markdown>{project.overview}</Markdown>
      )}

      {project.techStack.length > 0 && (
        <div>
          <h3 className="text-sm">Tech stack</h3>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.techStack.map((tech) => (
              <Badge key={tech}>{tech}</Badge>
            ))}
          </div>
        </div>
      )}

      {project.metrics && project.metrics.length > 0 && (
        <div>
          <h3 className="text-sm">Metrics</h3>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm marker:text-muted">
            {project.metrics.map((metric) => (
              <li key={metric}>{metric}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function Decisions({ project }: { project: Project }) {
  const decisions = project.keyDecisions.filter((item) => !isTodo(item.decision))
  if (decisions.length === 0) return <NotWritten project={project} what="decisions" />

  return (
    <div className="space-y-4">
      {decisions.map((item) => (
        <Card key={item.decision}>
          <h3 className="text-base">{item.decision}</h3>
          <LabelledText label="Why">{item.why}</LabelledText>
          <LabelledText label="Alternatives considered">{item.alternatives}</LabelledText>
        </Card>
      ))}
    </div>
  )
}

function Challenges({ project }: { project: Project }) {
  const challenges = project.challenges.filter((item) => !isTodo(item.problem))
  if (challenges.length === 0) return <NotWritten project={project} what="challenges" />

  return (
    <div className="space-y-4">
      {challenges.map((item) => (
        <Card key={item.problem}>
          <h3 className="text-base">{item.problem}</h3>
          <LabelledText label="How I solved it">{item.solution}</LabelledText>
        </Card>
      ))}
    </div>
  )
}

export default function ProjectDetail() {
  const { projectId } = useParams()
  const project = projects.find((item) => item.id === projectId)

  // The tab lives in the URL so search results can link straight to a question.
  const [searchParams, setSearchParams] = useSearchParams()
  const requested = searchParams.get('tab')
  const tab = TABS.find((item) => item.id === requested)?.id ?? 'overview'

  useEffect(() => {
    if (project) {
      setLastVisited({ path: `/projects/${project.id}`, title: project.name, kind: 'project' })
    }
  }, [project])

  if (!project) {
    return (
      <EmptyState
        title="Project not found"
        description="It may have been renamed or removed."
        action={
          <Link to="/projects" className={buttonClasses('outline', 'sm')}>
            All projects
          </Link>
        }
      />
    )
  }

  const tagline = withoutTodo(project.tagline)
  const links = [
    { label: 'GitHub', href: project.links.github },
    { label: 'Live', href: project.links.live },
  ].filter((link) => link.href)

  return (
    <article className="max-w-reading">
      <Link
        to="/projects"
        className="inline-flex items-center gap-1.5 rounded-control text-sm text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Projects
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-xl">{project.name}</h1>
        <ProjectStatusBadge status={project.status} />
        {needsContent(project) && (
          <Badge className="border-dashed bg-transparent">Needs content</Badge>
        )}
      </div>
      {tagline && <p className="mt-1 text-sm text-muted">{tagline}</p>}

      {links.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className={buttonClasses('outline', 'sm')}
            >
              {link.label}
              <ExternalLink aria-hidden />
            </a>
          ))}
        </div>
      )}

      <div className="mt-8 overflow-x-auto">
        <Tabs
          tabs={TABS}
          value={tab}
          onChange={(id) => setSearchParams(id === 'overview' ? {} : { tab: id }, { replace: true })}
          className="min-w-max"
        />
      </div>

      <div className="mt-8" role="tabpanel">
        {tab === 'overview' && <Overview project={project} />}
        {tab === 'architecture' &&
          (isTodo(project.architecture) ? (
            <NotWritten project={project} what="architecture notes" />
          ) : (
            <Markdown>{project.architecture}</Markdown>
          ))}
        {tab === 'decisions' && <Decisions project={project} />}
        {tab === 'challenges' && <Challenges project={project} />}
        {tab === 'questions' && (
          <QuestionList
            questions={project.questions}
            emptyDescription={`Add questions in src/data/projects/${project.id}.ts.`}
          />
        )}
      </div>
    </article>
  )
}
