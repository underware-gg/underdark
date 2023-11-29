import { useSyncWorld } from '../hooks/useSyncWorld'
import { UnderdarkProvider } from '../hooks/UnderdarkContext'
import { GameplayProvider } from '../hooks/GameplayContext'
import { SettingsProvider } from '../hooks/SettingsContext'
import GameView from './GameView'
import GameUI from './GameUI'

function Underdark() {
  const { loading } = useSyncWorld()

  if (loading) {
    return <h1>syncing...</h1>
  }

  return (
    <UnderdarkProvider>
      <SettingsProvider>
        <GameplayProvider>
          <div className='GameContainer'>
            <GameView />
            <GameUI />
          </div>
        </GameplayProvider>
      </SettingsProvider>
    </UnderdarkProvider>
  )
}

export default Underdark
