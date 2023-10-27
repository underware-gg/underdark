import { useGameplayContext } from '../../hooks/GameplayContext'


function GameInfo() {
  const { isPlaying, stepCount, message } = useGameplayContext()

  return (
    <div className='GameInfo'>

      <div className='AlignCenter'>
        <div className='Message'>
          <h2>{message}</h2>
        </div>
      </div>

      {isPlaying && <div>steps: <b>{stepCount}</b></div>}

    </div>
  )
}

export default GameInfo
