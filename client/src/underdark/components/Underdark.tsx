import { useSyncWorld } from '../hooks/useGraphQLQueries'
import { UnderdarkProvider } from '../hooks/UnderdarkContext'
import MinterMap from './MinterMap'
import MinterData from './MinterData'
import GameCanvas from './GameCanvas'

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
      <br />
      <div className="card MinterPanel">
        <GameCanvas />
      </div>
    </UnderdarkProvider>
  )
}

export default Underdark
