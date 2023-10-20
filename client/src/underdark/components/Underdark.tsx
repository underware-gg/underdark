import { useSyncWorld } from '../hooks/useGraphQLQueries'
import { UnderdarkProvider } from '../hooks/UnderdarkContext'
import MinterMap from './MinterMap'
import MinterData from './MinterData'

function Underdark() {
  const { loading } = useSyncWorld()

  if (loading) {
    return <h1>loading...</h1>
  }

  return (
    <UnderdarkProvider>
      <div className="card MinterPanel">
        <MinterMap />
        <MinterData />
      </div>
    </UnderdarkProvider>
  )
}

export default Underdark
