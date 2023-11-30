import React from 'react'
import GameView from '@/underdark/components/GameView'
import GameUI from '@/underdark/components/GameUI'

function Underdark() {
  return (
    <div className='GameContainer'>
      <GameView />
      <GameUI />
    </div>
  )
}

export default Underdark
