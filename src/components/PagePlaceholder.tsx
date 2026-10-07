import EmptyState from './ui/EmptyState'

interface PagePlaceholderProps {
  title: string
  description?: string
}

export default function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <section>
      <h1 className="text-xl">{title}</h1>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      <EmptyState className="mt-8" title="Nothing here yet." />
    </section>
  )
}
