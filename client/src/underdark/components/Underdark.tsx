import React, { useEffect } from 'react'
import { useUnderdarkContext } from '@/underdark/hooks/UnderdarkContext'
import GameView from '@/underdark/components/GameView'
import GameUI from '@/underdark/components/GameUI'

function Underdark({
  isPlaying,
  roomId,
  levelNumber,
}) {
  const { dispatchSetRoom } = useUnderdarkContext()

  useEffect(() => {
    if (roomId && levelNumber) {
      dispatchSetRoom(roomId, levelNumber)
    }
  }, [roomId, levelNumber])

  return (
    <div className={`GameContainer ${isPlaying?'':'Hidden'}`}>
      <GameView />
      <GameUI />
    </div>
  )
}

export default Underdark
