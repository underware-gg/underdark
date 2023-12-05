import { useEffect, useMemo, useState } from 'react'
import { useGameEvent } from '@/underdark/hooks/useGameEvent'
import { map } from '@/underdark/utils/utils'

const _strip = '···E······S······W······N······E······S······W······N······E······S······W······N···'
const _stripStep = 7
const _stripSize = 21
function UICompass() {
  // const { playerPosition } = useGameplayContext()
  // const facingDirection = playerPosition ? DirNames[playerPosition.facing] : '?'

  const [start, setStart] = useState(0)
  const rotation = useGameEvent('rotatedTo')

  useEffect(() => {
    if (rotation) {
      let rot = rotation.z
      while (rot < 0) rot += Math.PI
      while (rot > Math.PI * 2) rot -= Math.PI
      setStart(map(rot, 0, Math.PI * 2, _stripStep * 2, _stripStep * 6))
      // console.log(rot)
    }
  }, [rotation])

  const dots = useMemo(() => {
    let result = []
    const strip = _strip.slice(start, start + _stripSize)
    for (let i = 0; i < strip.length; i++) {
      const a = Math.sin(map(i, 0, strip.length - 1, 0, Math.PI))
      const aa = `0${Math.floor(127 + a * 128).toString(16)}`.slice(-2)
      const size = map(a, 0, 1, 60, 100)
      // $color-active below...
      result.push(<span key={`d${i}`} style={{ color: `#cedf91${aa}`, fontSize: `${Math.ceil(size)}%` }}>{strip[i]}</span>)
    }
    return result
  }, [start])

  return (
    <div className='CompassUI'>
      {dots}
    </div>
  )
}

export default UICompass
