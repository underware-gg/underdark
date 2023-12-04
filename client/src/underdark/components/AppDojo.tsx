import React, { useState } from 'react'
import { useEffectOnce } from '@/underdark/hooks/useEffectOnce'
import { DojoProvider } from '@/dojo/DojoContext'
import { setup } from '@/dojo/setup.ts'
import { GameplayProvider } from '@/underdark/hooks/GameplayContext'
import { useSyncWorld } from '@/underdark/hooks/useSyncWorld'
import App from '@/underdark/components/App'


export default function AppDojo({
  title=null,
  children,
}) {
  return (
    <App title={title}>
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
      <DojoSync>
        {children}
      </DojoSync>
    </DojoProvider>
  );
}


function DojoSync({ children }) {
  const { loading } = useSyncWorld()

  if (loading) {
    return <h1>syncing...</h1>
  }

  return (
    <GameplayProvider>
      {children}
    </GameplayProvider>
  )
}
