import { Bookmark } from 'lucide-react'
import { cn } from '../lib/cn'
import { toggleBookmark } from '../lib/storage'
import { useProgress } from '../lib/useProgress'

export default function BookmarkButton({ questionId }: { questionId: string }) {
  const bookmarked = useProgress((progress) => progress.bookmarks.includes(questionId))

  return (
    <button
      type="button"
      onClick={() => toggleBookmark(questionId)}
      aria-pressed={bookmarked}
      aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this question'}
      className={cn(
        'rounded-control p-1.5 transition-colors hover:bg-subtle',
        bookmarked ? 'text-accent' : 'text-muted hover:text-ink',
      )}
    >
      <Bookmark className="size-4" fill={bookmarked ? 'currentColor' : 'none'} aria-hidden />
    </button>
  )
}
