import React from 'react'
import { GameplayProvider } from '@/underdark/hooks/GameplayContext'
import ModelsPage from '@/underdark/components/editor/ModelsPage'
import App from '@/underdark/components/App'

export default function Page() {
  return (
    <App>
      <GameplayProvider>
        <ModelsPage />
      </GameplayProvider>
    </App>
  );
}
