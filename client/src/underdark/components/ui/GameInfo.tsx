import { useGameplayContext } from '../../hooks/GameplayContext'
import { useUnderdarkContext } from '../../hooks/UnderdarkContext'
import { useChamber, useChamberMap } from '../../hooks/useChamber'


function GameInfo() {
  const { message } = useGameplayContext()

  return (
    <div className='GameInfo AlignCenter AlignMiddle'>

      <div className='Message'>
        <div className='CenteredContainer'>
          <RestartButton />
        </div>
        {/* {isPlaying && <p>steps: <b>{stepCount}</b></p>} */}
      </div>

      <div className='Message'>
        <div className='CenteredContainer'>
          <h2>{message}</h2>
        </div>
      </div>

    </div>
  )
}

const RestartButton = () => {
  const { chamberId } = useUnderdarkContext()
  const { chamberExists } = useChamber(chamberId)
  const { gameTilemap } = useChamberMap(chamberId)

  const { isLoaded, dispatchReset } = useGameplayContext()

  const _startGame = () => {
    dispatchReset(gameTilemap.playerStart, true)
  }

  if (!chamberExists) return <></>

  const _label = isLoaded ? 'START' : 'RESTART'

  return (
    <h3><button onClick={() => _startGame()}>{_label}</button></h3>
  )
}

export default GameInfo
