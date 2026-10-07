import type { Concept } from '../../types'

export const frontend: Concept[] = [
  {
    id: 'fe-react-core',
    title: 'React fundamentals',
    category: 'Frontend',
    summary: `React builds a UI out of **components**: functions that take props and state and return a description of what should be on screen. When state changes, React re-runs the component, compares the new output with the previous one (**reconciliation**) and applies only the differences to the DOM. **Hooks** such as useState, useEffect, useMemo and useRef are how function components hold state and interact with the outside world.`,
    keyPoints: [
      'UI is a function of state: change the state, and React updates the DOM.',
      'A component re-renders when its state changes, its parent re-renders, or a context it reads changes.',
      'Keys let React match list items between renders; they must be stable and unique.',
      'useEffect is for synchronising with external systems, not for deriving state.',
      'Never mutate state directly; create a new object or array.',
    ],
    relatedConceptIds: ['fe-nextjs', 'sd-reliability-scaling'],
    questions: [
      {
        id: 'fe-react-core-1',
        question: 'How does React rendering work? What are the virtual DOM and reconciliation?',
        answer: `When state changes, React calls the component function again to get a new description of the UI. That description is a tree of plain JavaScript objects, often called the **virtual DOM**.

**Reconciliation** is the step where React compares the new tree with the previous one to work out what actually changed. It uses heuristics to keep this fast: elements of different types are treated as entirely different subtrees, and **keys** identify which items in a list are the same between renders.

Then, in the commit phase, React applies only those differences to the real DOM.

The point is that I describe what the UI should look like for a given state, and React works out the minimal DOM updates. An important detail is that "re-rendering" a component means calling its function again. It does not necessarily mean the DOM is touched.`,
        difficulty: 'medium',
        tags: ['react', 'rendering'],
        followUps: ['Why should you not use the array index as a key?'],
      },
      {
        id: 'fe-react-core-2',
        question: 'What causes a component to re-render, and how do you avoid unnecessary re-renders?',
        answer: `A component re-renders when:

- Its own **state** changes.
- Its **parent** re-renders, by default even if its props are the same.
- A **context** it consumes changes.

Most re-renders are cheap, so I only optimise when I have measured a problem with the React profiler. When I do:

- **React.memo** skips re-rendering a component when its props have not changed.
- **useMemo** caches an expensive computed value, and **useCallback** keeps a function reference stable, so that memoized children are not re-rendered by a new object or function on every render.
- **Keep state close to where it is used,** so a change re-renders a small subtree instead of the whole page.
- **Split contexts,** so a change to one value does not re-render every consumer.
- **Virtualise long lists** so only visible rows are rendered.

Memoization has its own cost and adds complexity, so I do not apply it everywhere by default.`,
        difficulty: 'medium',
        tags: ['react', 'performance'],
        followUps: ['When does React.memo not help?'],
      },
      {
        id: 'fe-react-core-3',
        question: 'How does useEffect work, and what are common mistakes with it?',
        answer: `useEffect runs a function **after** the component has rendered. It is meant for synchronising with something outside React: a network request, a subscription, a timer, or direct DOM work.

The **dependency array** controls when it runs. With no array it runs after every render; with an empty array, once after the first render; with values, whenever any of them changes. The function can return a **cleanup** function, which runs before the effect runs again and when the component unmounts.

Common mistakes:

- **Missing dependencies,** which leads to stale values captured from an old render.
- **No cleanup,** leaving subscriptions and timers running, or letting a slow request overwrite a newer one.
- **Infinite loops:** the effect sets state that is also in its own dependencies.
- **Using an effect to derive state.** If a value can be computed from props or state, I compute it during render instead.
- **Objects or functions as dependencies** that are recreated on every render, making the effect run every time.`,
        difficulty: 'medium',
        tags: ['react', 'hooks', 'useeffect'],
        followUps: ['How do you avoid a race condition when fetching data in an effect?'],
      },
      {
        id: 'fe-react-core-4',
        question: 'What is the difference between state and props, and how do you share state between components?',
        answer: `**Props** are inputs passed from a parent. The component receiving them treats them as read-only. **State** is data a component owns and can change, and changing it triggers a re-render.

Data flows one way, from parent to child through props. A child changes a parent's state by calling a function the parent passed down.

To share state between components, in order of increasing weight:

1. **Lift state up** to the closest common parent and pass it down as props.
2. **Context,** when many components at different depths need the same value, such as the current user or a theme, to avoid passing props through every level.
3. **A state management library** such as Zustand or Redux, when client state is complex and shared across the application.
4. **A server-state library** such as TanStack Query for data that comes from an API, since caching, refetching and loading states are a different problem from UI state.

I start with the simplest option and move up only when it becomes painful.`,
        difficulty: 'easy',
        tags: ['react', 'state'],
        followUps: ['What is prop drilling, and what are the downsides of using Context to avoid it?'],
      },
      {
        id: 'fe-react-core-5',
        question: 'How would you render a streaming LLM response in a React chat UI?',
        answer: `1. **Send the request and read the stream.** I call the backend with fetch and read the response body incrementally, decoding each chunk as it arrives, or use Server-Sent Events.
2. **Update state as chunks arrive.** I append each piece of text to the assistant message that is currently in progress, using a functional state update so I always build on the latest value.
3. **Render progressively.** The message list re-renders as the text grows. I render Markdown, and it needs to tolerate incomplete input such as an unclosed code block.
4. **Handle the surrounding states:** a "thinking" indicator before the first token, disabling the input while streaming, a stop button that aborts the request with an AbortController, and errors that happen mid-stream.
5. **Scroll behaviour:** auto-scroll to the bottom while streaming, and stop if the user scrolls up to read.

For performance on long conversations, I memoize the completed messages so that only the message being streamed re-renders on each chunk.`,
        difficulty: 'hard',
        tags: ['react', 'streaming', 'llm'],
        followUps: ['How would you let the user cancel a response that is being generated?'],
      },
    ],
  },
  {
    id: 'fe-nextjs',
    title: 'Next.js',
    category: 'Frontend',
    summary: `Next.js is a React framework that adds routing, server rendering, data fetching and API endpoints. Its central idea is choosing **where and when** each part of a page renders: at build time, on the server per request, or in the browser. In the App Router, components are **Server Components** by default and you opt into client-side interactivity with the "use client" directive.`,
    keyPoints: [
      'CSR renders in the browser; SSR on the server per request; SSG at build time; ISR regenerates static pages in the background.',
      'Server Components run only on the server and send no component JavaScript to the browser.',
      'Client Components are needed for state, effects, event handlers and browser APIs.',
      'Hydration attaches React to server-rendered HTML to make it interactive.',
      'Secrets such as API keys stay on the server: in Server Components, route handlers or server actions.',
    ],
    relatedConceptIds: ['fe-react-core', 'be-rest-api'],
    questions: [
      {
        id: 'fe-nextjs-1',
        question: 'What are the differences between CSR, SSR, SSG and ISR?',
        answer: `They differ in where and when the HTML is produced.

- **CSR (client-side rendering):** the server sends a nearly empty page and JavaScript; the browser renders everything. Simple to host, but a slower first paint and weaker for SEO. Fine for dashboards behind a login.
- **SSR (server-side rendering):** the server renders the HTML on **every request**. Content is always fresh and can be personalised, at the cost of server work per request.
- **SSG (static site generation):** HTML is generated once at **build time** and served from a CDN. The fastest and cheapest option, but the content is only as fresh as the last build.
- **ISR (incremental static regeneration):** static pages that are regenerated in the background after a set interval or on demand, so I get static speed with content that still updates.

I pick per page: static for marketing and docs, ISR for content that changes occasionally, SSR for personalised or real-time pages, and client rendering for highly interactive parts.`,
        difficulty: 'medium',
        tags: ['nextjs', 'rendering'],
        followUps: ['Which would you choose for a product page with a price that changes hourly?'],
      },
      {
        id: 'fe-nextjs-2',
        question: 'What is the difference between Server Components and Client Components?',
        answer: `In the App Router, components are **Server Components** by default. They render only on the server. They can be async and fetch data directly, read from a database, and use secrets, and their code is **not sent to the browser**, which keeps the JavaScript bundle smaller. They cannot use state, effects, event handlers or browser APIs.

A **Client Component** is marked with the "use client" directive at the top of the file. It can use useState, useEffect, onClick and browser APIs. A detail that surprises people: Client Components are still pre-rendered to HTML on the server for the initial load, and then hydrated in the browser.

The pattern I follow is to keep most of the tree as Server Components and push "use client" down to the small interactive leaves, such as a button or a form. A Server Component can render a Client Component and pass it serializable props; a Client Component can receive Server Components as children.`,
        difficulty: 'medium',
        tags: ['nextjs', 'server-components'],
        followUps: ['Why can you not pass a function as a prop from a Server Component to a Client Component?'],
      },
      {
        id: 'fe-nextjs-3',
        question: 'What is hydration, and what causes a hydration error?',
        answer: `With server rendering, the browser first receives ready-made HTML, so the user sees content quickly, but it is not interactive yet. **Hydration** is when React runs in the browser, builds its component tree, matches it against that existing HTML and attaches the event handlers and state.

A **hydration error** happens when what React renders on the client does not match the HTML the server sent. Typical causes:

- Rendering something that differs between server and client, such as the current time, a random value or a locale-formatted date.
- Reading browser-only values like window or localStorage during render.
- Invalid HTML nesting, which the browser silently corrects, so the DOM no longer matches.
- Browser extensions that modify the page.

The fixes are to keep the first render deterministic, move browser-only logic into an effect so it runs after hydration, or render that particular component only on the client.`,
        difficulty: 'medium',
        tags: ['nextjs', 'hydration'],
        followUps: ['How would you show a value from localStorage without a hydration mismatch?'],
      },
      {
        id: 'fe-nextjs-4',
        question: 'Why use Next.js instead of a plain React single-page app?',
        answer: `A plain React SPA, for example one built with Vite, renders entirely in the browser. That is perfectly good for an internal tool or an app behind a login, and it is simpler to host as static files.

Next.js adds things I would otherwise have to assemble:

- **Server rendering and static generation,** which improve first-load performance and SEO, because the content is in the HTML.
- **File-based routing** with layouts and nested routes.
- **A server side in the same project:** route handlers and server actions, so secrets such as an LLM API key stay on the server instead of in the browser.
- **Built-in optimisations** for images, fonts and code splitting.
- **Streaming** of UI with Suspense, which fits AI responses well.

The tradeoffs are more concepts to learn, such as the server and client component boundary and caching behaviour, and it needs a server or a platform that supports it. So I choose based on whether I need SEO, server rendering or a backend alongside the UI.`,
        difficulty: 'easy',
        tags: ['nextjs', 'tradeoffs'],
        followUps: ['How would you keep an LLM API key out of the browser in a Next.js app?'],
      },
      {
        id: 'fe-nextjs-5',
        question: 'How do you fetch data and keep an API key secret in a Next.js App Router application?',
        answer: `The rule is that anything secret must only run on the server.

**Fetching data:**

- In a **Server Component,** I can make the component async and fetch directly, or query the database. The result is rendered into HTML and the fetching code never reaches the browser.
- For **mutations,** I use server actions or route handlers.
- For **client-side interactivity,** such as a chat box, a Client Component calls a route handler of mine.

**Keeping a key secret:**

- Store it in an environment variable **without** the NEXT_PUBLIC prefix. Variables with that prefix are inlined into the browser bundle.
- Read it only in server code: Server Components, route handlers and server actions.
- For an LLM call from the UI, the browser calls my route handler, the handler calls the model provider with the key and streams the response back.

On that endpoint I also add authentication and rate limiting, because otherwise anyone who finds it can spend my quota.`,
        difficulty: 'medium',
        tags: ['nextjs', 'security', 'data-fetching'],
        followUps: ['Why is hiding the key behind your own endpoint not enough on its own?'],
      },
    ],
  },
]
