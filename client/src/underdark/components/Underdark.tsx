import { useSyncWorld } from '../hooks/useGraphQLQueries'
import { UnderdarkProvider } from '../hooks/UnderdarkContext'
import { GameplayProvider } from '../hooks/GameplayContext'
import MinterMap from './MinterMap'
import MinterData from './MinterData'
import GameView from './GameView'

function Underdark() {
  const { loading } = useSyncWorld()

  if (loading) {
    return <h1>loading...</h1>
  }

  return (
    <UnderdarkProvider>
      <GameplayProvider>
        <div className="card MinterPanel">
          <MinterMap />
          <MinterData />
        </div>
        <br />
        <div className="card MinterPanel">
          <GameView />
        </div>
      </GameplayProvider>
    </UnderdarkProvider>
  )
}

export default Underdark
