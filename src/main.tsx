import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// Dev-only content check (duplicate ids, broken links). The dynamic import
// keeps it, and the content it pulls in, out of the production entry chunk.
if (import.meta.env.DEV) {
  void import('./data/validate').then(({ warnOnContentIssues }) => warnOnContentIssues())
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
