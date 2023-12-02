import React, { useMemo } from 'react'
import { useDojoAccount, useDojoSystemCalls } from '@/dojo/DojoContext'
import { useGameplayContext } from '@/underdark/hooks/GameplayContext'
import { useUnderdarkContext } from '@/underdark/hooks/UnderdarkContext'
import { useChamber, useChamberMap, useChamberOffset, usePlayerScore } from '@/underdark/hooks/useChamber'
import { ActionButton } from '@/underdark/components/ui/UIButtons'
import { getLevelParams } from '@/underdark/data/levels'
import { loadAudioAssets } from '@/underdark/data/assets'
import { Dir, makeRoomChamberId } from '@/underdark/utils/underdark'


export const StartButton = () => {
  const { chamberId } = useUnderdarkContext()
  const { gameTilemap } = useChamberMap(chamberId)
  const { gameImpl, isLoaded, dispatchReset } = useGameplayContext()

  const _startGame = async () => {
    await loadAudioAssets(gameImpl?.getCameraRig())
    dispatchReset(gameTilemap.playerStart, true)
  }

  const _label = isLoaded ? 'START' : 'RESTART'
  return (
    <ActionButton onClick={() => _startGame()} label={_label} />
  )
}


export function GenerateButton() {
  const { account } = useDojoAccount()

  // generate first chamber
  const { roomId, chamberId } = useUnderdarkContext()
  const { yonder } = useChamber(chamberId)
  const canMintFirst = (yonder == 0)

  // for new next chambers
  const { chamberExists: nextChamberExists } = useChamberOffset(chamberId, Dir.Under)
  const canMintNext = (yonder > 0 && !nextChamberExists)

  const { isPlaying } = useGameplayContext()

  if (chamberId && (canMintFirst || canMintNext) && !isPlaying) {
    const _label = (canMintFirst ? 'GENERATE ROOM' : 'GENERATE NEXT LEVEL')
    return (
      <GenerateRoomButton roomId={roomId} levelNumber={yonder + 1} label={_label} />
    )
  }
  return <></>
}

export function GenerateRoomButton({
  roomId,
  levelNumber,
  label,
}) {
  const { realmId, manorCoord } = useUnderdarkContext()
  const { generate_level } = useDojoSystemCalls()
  const { account } = useDojoAccount()

  const chamberId = useMemo(() => makeRoomChamberId(roomId, levelNumber), [roomId, levelNumber])
  const { levelIsCompleted } = usePlayerScore(chamberId, account)

  const _generate = async () => {
    const _level = getLevelParams(levelNumber)
    const success = await generate_level(account, realmId, manorCoord, roomId, levelNumber, _level.generatorName, _level.generatorValue)
    if (success) {
      console.log(`GENERATED... TODO: START GAME`)
    }
  }

  if (!levelIsCompleted) {
    return <ActionButton onClick={() => _generate()} label={label} />
  }
  return <></>
}
