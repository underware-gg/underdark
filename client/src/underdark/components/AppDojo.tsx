import React, { useState } from 'react'
import { useEffectOnce } from '@/underdark/hooks/useEffectOnce'
import { DojoProvider } from '@/dojo/DojoContext'
import { setup } from '@/dojo/setup'
import { GameplayProvider } from '@/underdark/hooks/GameplayContext'
import App from '@/underdark/components/App'

export default function AppDojo({
  title = null,
  backgroundImage = null,
  children,
}) {
  return (
    <App title={title} backgroundImage={backgroundImage}>
      <DojoSetup>
        {children}
      </DojoSetup>
    </App>
  );
}

function DojoSetup({ children }) {
  const [setupResult, setSetupResult] = useState(null)

  useEffectOnce(() => {
    let _mounted = true
    const _setup = async () => {
      const result = await setup()
      console.log(`SETUP result:`, result)
      if (_mounted) {
        setSetupResult(result)
      }
    }
    _setup()
    return () => {
      _mounted = false
    }
  }, [])

  if (!setupResult) {
    return <h1>setup...</h1>
  }

  return (
    <DojoProvider value={setupResult}>
      <GameplayProvider>
        {children}
      </GameplayProvider>
    </DojoProvider>
  );
}
