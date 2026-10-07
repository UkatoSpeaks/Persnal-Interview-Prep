import { useState, type ReactNode } from 'react'
import { ArrowRight, Inbox, Plus } from 'lucide-react'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Collapsible from '../components/ui/Collapsible'
import EmptyState from '../components/ui/EmptyState'
import Input from '../components/ui/Input'
import Kbd from '../components/ui/Kbd'
import Markdown from '../components/ui/Markdown'
import ProgressBar from '../components/ui/ProgressBar'
import Tabs, { type TabItem } from '../components/ui/Tabs'
import Textarea from '../components/ui/Textarea'

const SWATCHES = [
  { name: 'canvas', value: '#FAFAFA', className: 'bg-canvas' },
  { name: 'surface', value: '#FFFFFF', className: 'bg-surface' },
  { name: 'subtle', value: '#F5F5F5', className: 'bg-subtle' },
  { name: 'line', value: '#E5E5E5', className: 'bg-line' },
  { name: 'muted', value: '#737373', className: 'bg-muted' },
  { name: 'ink', value: '#171717', className: 'bg-ink' },
  { name: 'accent', value: '#4F46E5', className: 'bg-accent' },
  { name: 'confident-soft', value: '#F0FDF4', className: 'bg-confident-soft' },
  { name: 'shaky-soft', value: '#FFFBEB', className: 'bg-shaky-soft' },
  { name: 'weak-soft', value: '#FEF2F2', className: 'bg-weak-soft' },
]

const TYPE_SCALE = [
  { label: '28 / text-xl', className: 'text-xl font-semibold tracking-tight' },
  { label: '20 / text-lg', className: 'text-lg font-semibold tracking-tight' },
  { label: '16 / text-base', className: 'text-base' },
  { label: '14 / text-sm', className: 'text-sm' },
  { label: '13 / text-xs', className: 'text-xs' },
]

type DemoTab = 'overview' | 'questions' | 'notes'

const DEMO_TABS: TabItem<DemoTab>[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'questions', label: 'Questions' },
  { id: 'notes', label: 'Notes' },
]

const MARKDOWN_SAMPLE = `## Retrieval-augmented generation

RAG grounds a model's answer in documents fetched at query time, instead of relying on what the model memorised. It trades a little latency for **fresher, citable answers**. See the [original paper](https://arxiv.org/abs/2005.11401).

1. Embed the query with the same model used for the corpus.
2. Fetch the top \`k\` chunks by cosine similarity.
3. Pass them to the model as context.

> Retrieval quality caps answer quality. Fix recall before tuning the prompt.

\`\`\`ts
async function answer(query: string): Promise<string> {
  const chunks = await retrieve(query, { k: 5 })
  // Keep the context small: irrelevant chunks hurt more than they help.
  const context = chunks.map((chunk) => chunk.text).join('\\n\\n')
  return complete(\`Context:\\n\${context}\\n\\nQuestion: \${query}\`)
}
\`\`\`

| Strategy | Recall | Cost |
| --- | --- | --- |
| Dense only | Medium | Low |
| Hybrid (BM25 + dense) | High | Medium |
| Hybrid + reranker | Highest | High |

- [x] Chunking
- [ ] Reranking
`

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-line py-10">
      <h2 className="mb-6 text-xs font-medium tracking-wide text-muted uppercase">{title}</h2>
      {children}
    </section>
  )
}

export default function UiPreview() {
  const [tab, setTab] = useState<DemoTab>('overview')

  return (
    <div>
      <h1 className="text-xl">Components</h1>
      <p className="mt-1 mb-10 text-sm text-muted">
        Every UI primitive in one place, for reviewing the look.
      </p>

      <Section title="Colors">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {SWATCHES.map((swatch) => (
            <div key={swatch.name}>
              <div className={`h-16 rounded-card border border-line ${swatch.className}`} />
              <p className="mt-2 text-xs font-medium">{swatch.name}</p>
              <p className="font-mono text-xs text-muted">{swatch.value}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typography">
        <div className="space-y-4">
          {TYPE_SCALE.map((step) => (
            <div key={step.label} className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-8">
              <span className="w-32 shrink-0 font-mono text-xs text-muted">{step.label}</span>
              <span className={step.className}>Explain how an agent decides to call a tool</span>
            </div>
          ))}
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-8">
            <span className="w-32 shrink-0 font-mono text-xs text-muted">mono</span>
            <code className="font-mono text-xs">const client = getGroqClient()</code>
          </div>
        </div>
      </Section>

      <Section title="Button">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Start practice</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button>
            <Plus aria-hidden />
            With icon
          </Button>
          <Button variant="outline">
            Next question
            <ArrowRight aria-hidden />
          </Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="sm" variant="outline">
            Small outline
          </Button>
          <Button size="sm" variant="ghost">
            Small ghost
          </Button>
        </div>
      </Section>

      <Section title="Card">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <h3 className="text-sm">Static card</h3>
            <p className="mt-1 text-sm text-muted">A 1px border on a white surface. No shadow.</p>
          </Card>
          <Card interactive className="cursor-pointer">
            <h3 className="text-sm">Clickable card</h3>
            <p className="mt-1 text-sm text-muted">Hover for the darker border and soft shadow.</p>
          </Card>
          <Card interactive className="cursor-pointer">
            <div className="flex items-center justify-between">
              <h3 className="text-sm">Vector databases</h3>
              <Badge tone="shaky">Shaky</Badge>
            </div>
            <p className="mt-1 text-sm text-muted">12 questions, 4 practised.</p>
          </Card>
        </div>
      </Section>

      <Section title="Badge">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>Neutral</Badge>
          <Badge tone="accent">Accent</Badge>
          <Badge tone="confident">Confident</Badge>
          <Badge tone="shaky">Shaky</Badge>
          <Badge tone="weak">Weak</Badge>
        </div>
      </Section>

      <Section title="Input and Textarea">
        <div className="max-w-md space-y-6">
          <div>
            <label htmlFor="ui-input" className="mb-2 block text-sm font-medium">
              Search
            </label>
            <Input id="ui-input" placeholder="Search questions" />
          </div>
          <div>
            <label htmlFor="ui-disabled" className="mb-2 block text-sm font-medium">
              Disabled
            </label>
            <Input id="ui-disabled" disabled defaultValue="Not editable" />
          </div>
          <div>
            <label htmlFor="ui-textarea" className="mb-2 block text-sm font-medium">
              Notes
            </label>
            <Textarea id="ui-textarea" placeholder="What tripped you up?" />
          </div>
        </div>
      </Section>

      <Section title="Tabs">
        <Tabs tabs={DEMO_TABS} value={tab} onChange={setTab} />
        <p className="mt-4 text-sm text-muted">
          Showing the <span className="text-ink">{tab}</span> panel. Arrow keys move between tabs.
        </p>
      </Section>

      <Section title="Kbd">
        <p className="flex flex-wrap items-center gap-2 text-sm text-muted">
          Press <Kbd>Space</Kbd> to reveal the answer, <Kbd>J</Kbd> and <Kbd>K</Kbd> to move, or
          <span className="inline-flex gap-1">
            <Kbd>Ctrl</Kbd>
            <Kbd>K</Kbd>
          </span>
          to search.
        </p>
      </Section>

      <Section title="EmptyState">
        <EmptyState
          icon={Inbox}
          title="No practice sessions yet"
          description="Finish a practice round and it will show up here."
          action={<Button size="sm">Start practice</Button>}
        />
      </Section>

      <Section title="ProgressBar">
        <div className="max-w-md space-y-6">
          <ProgressBar label="Questions practised" value={62} />
          <ProgressBar label="Confident" value={48} tone="confident" />
          <ProgressBar label="Shaky" value={34} tone="shaky" />
          <ProgressBar label="Weak" value={18} tone="weak" />
        </div>
      </Section>

      <Section title="Collapsible">
        <div className="max-w-reading space-y-3">
          <Collapsible title="What is the difference between a tool and an agent?" defaultOpen>
            <p className="text-muted">
              A tool is a function the model can call. An agent is the loop that decides which
              tool to call next, reads the result, and repeats until the task is done.
            </p>
          </Collapsible>
          <Collapsible title="When would you avoid fine-tuning?">
            <p className="text-muted">
              When the knowledge changes often, or when retrieval and a better prompt already get
              you there.
            </p>
          </Collapsible>
        </div>
      </Section>

      <Section title="Markdown">
        <div className="max-w-reading">
          <Markdown>{MARKDOWN_SAMPLE}</Markdown>
        </div>
      </Section>
    </div>
  )
}
