import React, { useEffect, useState } from 'react'
import { useUnderdarkContext } from '@/underdark/hooks/UnderdarkContext'
import { useGameplayContext } from '../hooks/GameplayContext'
import { loadAudioAssets, isAudioAssetsLoaded } from '@/underdark/data/assets'
import GameView from '@/underdark/components/GameView'
import GameUI from '@/underdark/components/GameUI'
import { ActionButton } from './ui/UIButtons'

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
    <div className={`GameContainer UIBorder ${isPlaying?'':'Hidden'}`}>
      <GameView />
      <GameUI />
      <GameStartOverlay />
    </div>
  )
}


//------------------------------------------------
// Overlay to load audio ssets
// Asks for interaction if necessary
//
function GameStartOverlay({
}) {
  const { gameImpl, hasInteracted, isLoaded, inLobby, dispatchInteracted, dispatchReset } = useGameplayContext()
  const [audioAssetsLoaded, setAudioAssetsLoaded] = useState(undefined)

  const _startGame = async () => {
    setAudioAssetsLoaded(false)
    await loadAudioAssets(gameImpl?.getCameraRig())
    setAudioAssetsLoaded(true)
    dispatchReset(null, true)
  }

  useEffect(() => {
    setAudioAssetsLoaded(isAudioAssetsLoaded())
    if (isLoaded && hasInteracted && !inLobby) {
      _startGame()
    }
  }, [isLoaded, hasInteracted, inLobby])

  if (audioAssetsLoaded === true) {
    return <></>
  }

  return (
    <div className={`GameView Overlay CenteredContainer`}>
      {audioAssetsLoaded === undefined && <ActionButton label='START GAME' onClick={() => dispatchInteracted()} />}
      {audioAssetsLoaded === false && <h1>loading assets...</h1>}
    </div>
  )
}

export default Underdark
