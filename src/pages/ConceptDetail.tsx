import { useParams } from 'react-router-dom'
import PagePlaceholder from '../components/PagePlaceholder'

export default function ConceptDetail() {
  const { conceptId } = useParams()
  return <PagePlaceholder title="Concept" description={conceptId} />
}
