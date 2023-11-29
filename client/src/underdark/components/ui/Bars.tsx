import { useGameplayContext } from '../../hooks/GameplayContext'

function LightBar() {
  const { light } = useGameplayContext()
  return (
    <Bar icon={'🔥'} value={light}/>
  )
}

function HealthBar() {
  const { light, health } = useGameplayContext()
  return (
    <Bar icon={'🐤'} value={health} />
  )
}

function Bar({
  icon,
  value,
}) {
  return (
    <div className='ColUI'>
      <div className='ColUISlider' style={{height: `${value}%`}} />
      <div className='ColUIContents'>
        <h2>
          {icon}
          <br />
          {value}%
        </h2>
      </div>
    </div>
  )
}

export {
  LightBar,
  HealthBar,
}
