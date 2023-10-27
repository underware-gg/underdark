import { useGameplayContext } from '../../hooks/GameplayContext'
import { useUnderdarkContext } from '../../hooks/UnderdarkContext'
import { useChamberMap } from '../../hooks/useChamber'


function GameInfo() {
  const { isPlaying, stepCount, message } = useGameplayContext()

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
  const { gameTilemap } = useChamberMap(chamberId)
  const { dispatchReset } = useGameplayContext()

  const _restart = () => {
    dispatchReset(gameTilemap.playerStart)
  }

  return (
    <h3><button onClick={() => _restart()}>RESTART</button></h3>
  )
}

export default GameInfo
