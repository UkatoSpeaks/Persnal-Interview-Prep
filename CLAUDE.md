# PrepAgent

Personal interview-prep web app for AI Engineer / Agentic AI / Full Stack interviews. Single user (the repo owner); no accounts, no multi-user concerns.

## Hard constraints

These are not negotiable. Do not propose or add anything that breaks them.

- **No backend, no database.** Everything runs in the browser. No server, no serverless functions, no API routes, no hosted DB or auth.
- **Content lives in the repo.** Projects, questions and AI concepts are typed local data files in `src/data/`. Adding content means editing those files.
- **User progress lives in localStorage.** Bookmarks, confidence ratings, notes and practice history. All access goes through `src/lib/storage.ts`; never call `localStorage` directly from components or pages.
- **AI features call Groq directly from the browser** with the official `groq-sdk` (`dangerouslyAllowBrowser: true`). Always get the client from `src/lib/groq.ts`.
- **The Groq API key is entered on the Settings page and stored in localStorage.** Never hardcode it or put it in source or build config. A gitignored local `.env` may set `VITE_GROQ_API_KEY` as a dev fallback (the Settings key wins); read it only through `getApiKey()` in `src/lib/storage.ts`. Vite inlines `VITE_*` values into the bundle, so never deploy or share a build made with that variable set.
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
- `npm run typecheck` — `tsc --noEmit`

## Folder structure

```
src/
  data/        projects, questions, concepts (typed .ts files)
  types/       shared TypeScript types
  lib/         storage.ts (localStorage helpers), groq.ts (Groq client), cn.ts
  components/  app shell (Layout, Sidebar, ...)
    ui/        design-system primitives (Button, Card, Markdown, ...)
  pages/       Dashboard, Projects, ProjectDetail, Concepts, ConceptDetail,
               Practice, MockInterview, Settings, UiPreview (/ui)
  App.tsx      route table
  main.tsx     entry point
```

- Routes are defined in `src/App.tsx`; sidebar links in `src/components/Sidebar.tsx`. A new page needs both.
- Shared types go in `src/types/`, not next to the component that first uses them.
- Progress records are keyed by content `id`, so ids in `src/data/` must be unique across projects, concepts and questions, and must not be renamed once in use.

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
- **Components:** use the primitives in `src/components/ui/` (Button, Card, Badge, Input, Textarea, Tabs, Kbd, EmptyState, ProgressBar, Collapsible, Markdown) rather than restyling raw elements per page. No component library with heavy default styling.
- **`/ui` previews every primitive.** When you add or change one, update `src/pages/UiPreview.tsx` to show it.
