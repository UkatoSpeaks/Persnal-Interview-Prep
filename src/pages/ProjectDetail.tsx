import { useParams } from 'react-router-dom'
import PagePlaceholder from '../components/PagePlaceholder'

export default function ProjectDetail() {
  const { projectId } = useParams()
  return <PagePlaceholder title="Project" description={projectId} />
}
