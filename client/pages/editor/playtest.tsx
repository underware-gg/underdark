import React from 'react'
import { UnderdarkProvider } from '@/underdark/hooks/UnderdarkContext'
import { GameplayProvider } from '@/underdark/hooks/GameplayContext'
import PlaytestPage from '@/underdark/components/editor/PlaytestPage'
import App from '@/underdark/components/App'

export default function Page() {
  return (
    <App>
      <UnderdarkProvider>
        <GameplayProvider>
          <PlaytestPage />
        </GameplayProvider>
      </UnderdarkProvider>
    </App>
  );
}
