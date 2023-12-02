import React from 'react'
import { useGameplayContext } from '@/underdark/hooks/GameplayContext'
import { useUnderdarkContext } from '@/underdark/hooks/UnderdarkContext'
import { useChamber } from '@/underdark/hooks/useChamber'
import { GenerateButton, StartButton } from '@/underdark/components/Buttons'

function InfoPanel() {
  const { chamberId } = useUnderdarkContext()
  const { chamberExists } = useChamber(chamberId)
  const { message } = useGameplayContext()

  return (
    <div className='InfoPanel AlignCenter AlignMiddle'>

      <div className='InfoTop'>
        {chamberExists &&
          <StartButton />
        }
      </div>
      <div className='InfoTop'>
        <GenerateButton />
      </div>
      {/* {isPlaying && <p>steps: <b>{stepCount}</b></p>} */}

      <div className='CenteredContainer'>
        <div className='CenteredContent InfoBottom'>
          <h2>{message}</h2>
        </div>
      </div>

    </div>
  )
}

export default InfoPanel
