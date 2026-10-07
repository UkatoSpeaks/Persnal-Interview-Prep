import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'

// One chunk per page, so heavy dependencies (react-markdown, highlight.js)
// only load on the pages that use them. Layout holds the Suspense boundary.
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Projects = lazy(() => import('./pages/Projects'))
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'))
const Concepts = lazy(() => import('./pages/Concepts'))
const ConceptDetail = lazy(() => import('./pages/ConceptDetail'))
const Practice = lazy(() => import('./pages/Practice'))
const MockInterview = lazy(() => import('./pages/MockInterview'))
const Settings = lazy(() => import('./pages/Settings'))
const UiPreview = lazy(() => import('./pages/UiPreview'))

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:projectId" element={<ProjectDetail />} />
        <Route path="concepts" element={<Concepts />} />
        <Route path="concepts/:conceptId" element={<ConceptDetail />} />
        <Route path="practice" element={<Practice />} />
        <Route path="mock-interview" element={<MockInterview />} />
        <Route path="settings" element={<Settings />} />
        {/* Dev-only: reachable by URL, deliberately not in the sidebar. */}
        <Route path="ui" element={<UiPreview />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
