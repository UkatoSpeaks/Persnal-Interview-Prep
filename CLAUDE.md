# PrepAgent

Personal interview-prep web app for AI Engineer / Agentic AI / Full Stack interviews. Single user (the repo owner); no accounts, no multi-user concerns.

## Hard constraints

These are not negotiable. Do not propose or add anything that breaks them.

- **No backend, no database.** Everything runs in the browser. No server, no serverless functions, no API routes, no hosted DB or auth. The one exception is the Groq proxy in `vite.config.ts` (below), which only forwards requests and adds the key.
- **Content lives in the repo.** Projects, concepts and their questions are typed local data files in `src/data/`. Adding content means editing those files (see "How to add content").
- **Questions and answers are curated, not generated at runtime.** The LLM may coach, grade or ask follow-ups on top of them, but it never invents the question bank or the reference answers.
- **User progress lives in localStorage.** Bookmarks, confidence ratings (weak / shaky / confident), notes and practice history, all keyed by question id. All access goes through `src/lib/storage.ts`; never call `localStorage` directly from components or pages. Components read it with `useProgress(selector)` from `src/lib/useProgress.ts` and write it with the helpers in `storage.ts` (`setConfidence`, `toggleBookmark`, `setNote`, ...), which update every subscribed component.
- **AI features call Groq through the Vite proxy.** The browser uses the official `groq-sdk` (`dangerouslyAllowBrowser: true`, placeholder `apiKey`) pointed at `/api/groq` on its own origin; `vite.config.ts` forwards that to `https://api.groq.com` and sets the `Authorization` header. Always get the client from `src/lib/groq.ts`.
- **The Groq API key lives only in the gitignored local `.env` as `GROQ_API_KEY`** (template in `.env.example`) and is injected by the Vite proxy. Never expose it to client code: no `VITE_` prefix, no `import.meta.env`, no `define`, no localStorage, never hardcoded or committed. The Settings page can only test the connection; it cannot see or edit the key.
- **The app runs via `npm run dev` or `npm run preview` only.** `dist/` has no key and no proxy, so a static deploy of it has no working AI features. Keep the server on localhost (no `--host`): anyone who can reach it can spend the key.
- **Everything must be free.** No paid services, APIs or tiers.

## Stack

- Vite + React + TypeScript
- Tailwind CSS (v4, via `@tailwindcss/vite`; no `tailwind.config.js`, theme goes in `src/index.css`)
- React Router (`react-router-dom`)
- `lucide-react` for icons
- `framer-motion` for subtle transitions only
- `react-markdown` + `remark-gfm` + `rehype-highlight` for markdown (always through `src/components/ui/Markdown.tsx`)
- No component library with heavy default styling (no MUI, Chakra, Ant, Bootstrap, etc.). Build UI from Tailwind classes.

## Commands

- `npm run dev` — start the dev server
- `npm run build` — typecheck, then production build
- `npm run preview` — serve the production build locally, with the Groq proxy
- `npm run typecheck` — `tsc --noEmit`

## Folder structure

```
src/
  data/
    projects/  one file per project + index.ts
    concepts/  one file per concept category + index.ts
    index.ts   builds the projects, concepts and questions arrays
    validate.ts  dev-only check for duplicate ids and broken links
  types/       shared TypeScript types
  lib/         storage.ts (localStorage helpers), groq.ts (Groq client), cn.ts
  components/  app shell (Layout, Sidebar, ...)
    ui/        design-system primitives (Button, Card, Markdown, ...)
  pages/       Dashboard, Projects, ProjectDetail, Concepts, ConceptDetail,
               Practice, MockInterview, Settings, UiPreview (/ui)
  App.tsx      route table
  main.tsx     entry point
```

- Routes are defined in `src/App.tsx`; sidebar links in `src/components/Sidebar.tsx`. A new page needs both, except dev-only routes (currently just `/ui`), which get a route but no sidebar link and are reachable by URL only.
- Pages are lazy-loaded in `src/App.tsx` with `React.lazy`; the `Suspense` boundary (plain text fallback) is in `src/components/Layout.tsx`. Add new pages the same way, and don't import a page statically from anywhere else.
- Shared types go in `src/types/`, not next to the component that first uses them.
- Questions are always rendered with `QuestionList` / `QuestionItem` from `src/components/`: collapsed by default, with the confidence picker, bookmark and notes built in. Don't build a second question UI. The one exception is the flashcard in `src/pages/Practice.tsx`.
- Practice ratings go through `rateQuestion` in `storage.ts`, which sets the confidence and schedules the next review (`Progress.reviews`, intervals in `src/lib/review.ts`). Session building and the `/practice` URL params (`filter`, `project`, `category`, `limit`) are in `src/lib/practice.ts`.
- Global search is `src/components/CommandPalette.tsx` (Cmd/Ctrl+K), lazy-loaded from `Layout`. It indexes projects, concepts and questions at module load; a new kind of content needs an entry there. Question results link to `#<question id>` on the detail page.
- Local content renders synchronously. No spinners or skeletons for data from `src/data/`.
- Progress records are keyed by content `id`, so ids in `src/data/` must be unique across projects, concepts and questions, and must not be renamed once in use.

## How to add content

Types are in `src/types/index.ts`. Pages import `projects`, `concepts` and `questions` from `src/data` (the folder index), never from an individual content file.

- **New project:** create `src/data/projects/<name>.ts` exporting one `Project` (copy `kavach.ts`), then add `export * from './<name>'` to `src/data/projects/index.ts`.
- **New concept category:** add the name to `CONCEPT_CATEGORIES` in `src/types/index.ts` (the array order is the display order), create `src/data/concepts/<category>.ts` exporting one `Concept[]` (copy `rag.ts`), then add `export * from './<category>'` to `src/data/concepts/index.ts`.
- **New concept or question in an existing category or project:** edit that file. No index change.
- Each content file has exactly one export; the indexes collect every export, so a second export would be treated as content.
- **Ids:** kebab-case and prefixed by their parent: concept `rag-chunking`, its questions `rag-chunking-1`, `rag-chunking-2`. Number new questions upward; never reuse or renumber an id, since saved progress points at it.
- **Answers** are markdown in the first person, the way they would be said in an interview. If a fact is uncertain, leave it out.
- Content strings are template literals, so escape any backtick or `${` inside them.
- In dev, `src/data/validate.ts` warns in the browser console about duplicate ids and `relatedConceptIds` that point at nothing. Check the console after adding content.

## Design rules

Look and feel: light, clean, minimal and calm, in the style of Linear, Vercel and Notion. It should feel like a premium tool, not a template.

- **Light theme only, for now.** All colors are CSS variables in the `@theme` block of `src/index.css`, so a dark theme can be added later. Use the token utilities (`bg-canvas`, `text-muted`, `border-line`, ...); never hardcode a hex value or reach for a Tailwind palette color (`zinc-*`, `indigo-*`, ...) in a component.
- **Palette:**
  - Page background `canvas` #FAFAFA
  - Cards and surfaces `surface` #FFFFFF
  - Borders `line` #E5E5E5
  - Body text `ink` #171717
  - Secondary text `muted` #737373
  - One accent, a muted indigo, `accent` #4F46E5. Use it sparingly: active nav, primary buttons, focus rings.
- **No gradients, no glassmorphism, no heavy shadows.** Use 1px borders. The only shadow is `shadow-hover`, a very soft one on hover for clickable cards.
- **Fonts:** Inter (Google Fonts) for all text, with `font-feature-settings: "cv11", "ss01"`. JetBrains Mono for code.
- **Type scale:** 13/14/16/20/28px only (`text-xs` / `text-sm` / `text-base` / `text-lg` / `text-xl`; other sizes are removed from the theme). Headings are semibold with slightly tight letter-spacing. Never all-caps labels, except tiny section headers.
- **Spacing:** generous whitespace on an 8px grid. Max ~760px content width on reading pages (`max-w-reading`); wider grids for card lists.
- **Shape:** 8px radius on cards (`rounded-card`), 6px on buttons and inputs (`rounded-control`).
- **Motion:** 150ms ease transitions, on hover and focus only. `framer-motion` only for a subtle fade or slide on page changes and disclosure; nothing bouncy, decorative or attention-seeking.
- **Status colors only carry meaning:** green = confident, amber = shaky, red = weak. Use the soft tinted backgrounds (`bg-confident-soft`, ...), not saturated fills.
- **Sidebar:** white background with a right border, the app name at the top, nav items with icons. The active item gets a light gray background and an accent-colored icon. Fixed on desktop; a slide-in drawer on mobile (below `md`).
- **Icons:** `lucide-react` only.
- **Components:** use the primitives in `src/components/ui/` (Button, Card, Badge, Input, Textarea, Select, Tabs, Kbd, EmptyState, ProgressBar, Collapsible, Markdown) rather than restyling raw elements per page. No component library with heavy default styling.
- **`/ui` previews every primitive.** It is a dev-only route with no sidebar link. When you add or change one, update `src/pages/UiPreview.tsx` to show it.
