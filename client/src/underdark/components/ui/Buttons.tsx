import React, { useMemo } from 'react'
import { useDojoAccount, useDojoSystemCalls } from '@/dojo/DojoContext'
import { useGameplayContext } from '@/underdark/hooks/GameplayContext'
import { useUnderdarkContext } from '@/underdark/hooks/UnderdarkContext'
import { useChamber, useChamberOffset, usePlayerScore } from '@/underdark/hooks/useChamber'
import { useSettingsContext } from '@/underdark/hooks/SettingsContext'
import { ActionButton } from '@/underdark/components/ui/UIButtons'
import { getLevelParams } from '@/underdark/data/levels'
import { loadAudioAssets } from '@/underdark/data/assets'
import { Dir, coordToCompass, makeRoomChamberId, makeRoomUrl } from '@/underdark/utils/underdark'
import { useRouter } from 'next/navigation'


export const StartButton = ({
  fill = false,
}) => {
  const { gameImpl, isLoaded, dispatchReset } = useGameplayContext()

  const _startGame = async () => {
    await loadAudioAssets(gameImpl?.getCameraRig())
    dispatchReset(null, true)
  }

  const _label = isLoaded ? 'START' : 'RESTART'
  return (
    <ActionButton fill={fill} onClick={() => _startGame()} label={_label} />
  )
}


export function NextLevelButton() {
  const { roomId, chamberId } = useUnderdarkContext()
  const { chamberExists } = useChamberOffset(chamberId, Dir.Under)

  const compass = coordToCompass(chamberId)
  const nextLevelNumber = compass.under + 1

  const router = useRouter()
  const _gotoNextLevel = () => {
    const url = makeRoomUrl(roomId, nextLevelNumber)
    router.push(url)
  }

  if (!chamberExists) {
    return <GenerateRoomButton large roomId={roomId} levelNumber={nextLevelNumber} label='GENERATE NEXT LEVEL' />
  }

  return <ActionButton large label='ENTER NEXT LEVEL' onClick={() => _gotoNextLevel()} />
}


interface SettingsButtonProps {
  prefix: string
  name: string
  value: boolean
}

export function SettingsButton({
  prefix,
  name,
  value,
}: SettingsButtonProps) {
  const { dispatch } = useSettingsContext()
  const _switch = () => {
    dispatch({
      type: name,
      payload: !value,
    })
  }
  return <ActionButton fill dimmed={!value} label={`${prefix} ${value ? 'ON' : 'OFF'}`} onClick={() => _switch()} />
}


export function GenerateRoomButton({
  roomId,
  levelNumber,
  label,
  large = false,
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
    return <ActionButton large={large} onClick={() => _generate()} label={label} />
  }
  return <></>
}
