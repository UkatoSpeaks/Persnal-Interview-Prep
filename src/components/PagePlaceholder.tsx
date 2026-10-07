interface PagePlaceholderProps {
  title: string
  description?: string
}

export default function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {description && <p className="mt-1 text-sm text-zinc-400">{description}</p>}
      <div className="mt-8 rounded-lg border border-dashed border-zinc-800 px-6 py-16 text-center text-sm text-zinc-500">
        Nothing here yet.
      </div>
    </section>
  )
}
