import { useGameplayContext } from '../../hooks/GameplayContext'
import { DirNames } from '../../utils/underdark'

function LightBar() {
  const { light } = useGameplayContext()
  return (
    <div className='ColUI'>
      <h2>
        {light}%
        <br />
        🔆
      </h2>
    </div>
  )
}

function HealthBar() {
  const { light, health } = useGameplayContext()
  return (
    <div className='ColUI'>
      <h2>
        {health}%
        <br />
        🩸
      </h2>
    </div>
  )
}

function CompassBar() {
  const { playerPosition } = useGameplayContext()
  const facingDirection = playerPosition ? DirNames[playerPosition.facing] : '?'
  return (
    <div className='CompassUI'>
      <h3>
        looking {facingDirection}
      </h3>
    </div>
  )
}

export {
  LightBar,
  HealthBar,
  CompassBar,
}
