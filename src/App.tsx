import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Concepts from './pages/Concepts'
import ConceptDetail from './pages/ConceptDetail'
import Practice from './pages/Practice'
import MockInterview from './pages/MockInterview'
import Settings from './pages/Settings'

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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
