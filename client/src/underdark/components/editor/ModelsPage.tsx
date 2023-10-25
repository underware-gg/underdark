import { useEffect, useState } from 'react'
import { useGameplayContext } from '../../hooks/GameplayContext'
import { useKeyDown } from '../../hooks/useKeyDown'
import ModelsCanvas from './ModelsCanvas'
import { Point } from '../MapView'

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

  return (
    <ModelsCanvas />
  )
}

export default ModelsPage
