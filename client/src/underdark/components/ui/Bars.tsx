import { useGameplayContext } from '../../hooks/GameplayContext'

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
  return (
    <div className='CompassUI'>
      <h3>
        compass: {playerPosition?.facing ?? '?'}
      </h3>
    </div>
  )
}

export {
  LightBar,
  HealthBar,
  CompassBar,
}
