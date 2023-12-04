import React from 'react'
import { useGameplayContext } from '@/underdark/hooks/GameplayContext'
import { useUnderdarkContext } from '@/underdark/hooks/UnderdarkContext'

function InfoPanel() {
  const { message } = useGameplayContext()

  return (
    <div className='InfoPanel AlignCenter'>
      <div className='CenteredContainer FillParent'>
        <div className='CenteredContent InfoBottom AlignMiddle'>
          <h2>{message}</h2>
        </div>
      </div>
    </div>
  )
}

export default InfoPanel
