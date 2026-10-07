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
  lib/         storage.ts (localStorage helpers), groq.ts (Groq client)
  components/  reusable UI (Layout, Sidebar, ...)
  pages/       Dashboard, Projects, ProjectDetail, Concepts, ConceptDetail,
               Practice, MockInterview, Settings
  App.tsx      route table
  main.tsx     entry point
```

- Routes are defined in `src/App.tsx`; sidebar links in `src/components/Sidebar.tsx`. A new page needs both.
- Shared types go in `src/types/`, not next to the component that first uses them.
- Progress records are keyed by content `id`, so ids in `src/data/` must be unique across projects, concepts and questions, and must not be renamed once in use.

## Design rules

- Icons: `lucide-react` only.
- Motion: `framer-motion` only, and only for subtle transitions (short fades and slides). Nothing decorative or attention-seeking.
- No component library with heavy default styling.
- The sidebar is fixed on desktop and a slide-in drawer on mobile (below `md`).

<!-- TODO: the owner's full design rules were not included in the initial brief. Add them here. -->
