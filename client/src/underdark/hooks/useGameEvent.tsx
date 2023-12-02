import { useState } from 'react'
import { useEffectOnce } from '@/underdark/hooks/useEffectOnce'
import { emitter } from '@/underdark/three/game'

export const useGameEvent = (eventName) => {
  const [value, setValue] = useState(null)

  useEffectOnce(() => {
    let _mounted = true

    const _callback = (v) => {
      if (_mounted) {
        setValue(v)
      }
    }

    emitter.on(eventName, _callback);

    return () => {
      _mounted = false
      emitter.off(eventName, _callback)
    }

  }, [])
  return value
}