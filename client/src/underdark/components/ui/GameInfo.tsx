import { useGameplayContext } from '../../hooks/GameplayContext'


function GameInfo() {
  const { stepCount, message } = useGameplayContext()

  return (
      <div className='MapView'>

      <p>steps: <b>{stepCount}</b></p>
      <p><b>{message}</b></p>

    </div>
  )
}

export default GameInfo
