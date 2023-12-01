import React from 'react'
import AppDojo from '@/underdark/components/AppDojo'
import GameView from '@/underdark/components/GameView'
import GameUI from '@/underdark/components/GameUI'

export default function Page() {
  return (
    <AppDojo>
      <div className='GameContainer'>
        <GameView />
        <GameUI />
      </div>
    </AppDojo>
  );
}
