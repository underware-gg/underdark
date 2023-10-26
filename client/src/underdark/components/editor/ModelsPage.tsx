import { useEffect, useState } from 'react'
import { useGameplayContext } from '../../hooks/GameplayContext'
import { useKeyDown } from '../../hooks/useKeyDown'
import { Point } from '../MapView'
import ThreeJsCanvas from '../../three/ThreeJsCanvas'
import * as game from './game'

function ModelsPage() {
  return (
    <div>
      <ModelsView />
    </div>
  )
}

const ModelsView = () => {
  const { gameLoop } = useGameplayContext()
  const [playerPosition, setPlayerPosition] = useState<Point>({ x: 0, y: -3 })

  useKeyDown(() => (_move(0, 1)), ['ArrowUp', 'w'])
  useKeyDown(() => (_move(0, -1)), ['ArrowDown', 's'])

  const _move = (dx, dy) => {
    setPlayerPosition({
      x: playerPosition.x + dx,
      y: playerPosition.y + dy,
    })
  }

  useEffect(() => {
    //@ts-ignore
    gameLoop?.movePlayer(playerPosition)
  }, [gameLoop, playerPosition])

  return <ThreeJsCanvas width={900} height={700} guiEnabled={true} gameLoop={game} />
}

export default ModelsPage
