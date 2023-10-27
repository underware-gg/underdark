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

export {
  LightBar,
  HealthBar,
}
