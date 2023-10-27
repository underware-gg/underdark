import { useEffect, useMemo, useState } from 'react'
import { useDojoSystemCalls, useDojoAccount, useDojoComponents } from '../../../DojoContext'
import { useChamber, useChamberMap, useChamberOffset, useGameChamberIds, useLevelScores, usePlayerScore } from '../../hooks/useChamber'
import { useUnderdarkContext } from '../../hooks/UnderdarkContext'
import { Dir, coordToSlug } from '../../utils/underdark'
import { useGameplayContext } from '../../hooks/GameplayContext'
import { bigintToHex, map } from '../../utils/utils'
import { useComponentValue } from '@latticexyz/react'
import { getEntityIdFromKeys } from '../../../utils/utils'
import { levels } from '../../data/levels'
// import { Account } from 'starknet'


// let params = {
//   fov: CAM_FOV,
//   far: CAM_FAR,
//   gamma: GAMMA,
//   colorCount: COLOR_COUNT,
//   dither: DITHER,
//   ditherSize: DITHER_SIZE,
//   bayer: BAYER,
//   palette: PALETTE,
// };


function GameInfo() {
  const { start_level } = useDojoSystemCalls()
  const { account } = useDojoAccount()

  const { light, health, stepCount, message } = useGameplayContext()

  // Current Realm / Chamber
  const { gameId, chamberId, dispatch, UnderdarkActions } = useUnderdarkContext()
  const { seed, yonder } = useChamber(chamberId)

  const chamberExists = useMemo(() => (seed > 0), [seed])
  const canMintFirst = useMemo(() => (gameId > 0 && !chamberExists), [gameId, chamberExists])

  const { chamberIds } = useGameChamberIds(gameId)
  useEffect(() => {
    _selectChamber(chamberIds.length > 0 ? chamberIds[chamberIds.length - 1] : 0n)
  }, [chamberIds])

  const _setSelectedGame = (newGameId: number) => {
    if (newGameId > 0) {
      dispatch({
        type: UnderdarkActions.SET_GAME,
        payload: newGameId,
      })
    }
  }

  const _selectChamber = (coord: bigint) => {
    dispatch({
      type: UnderdarkActions.SET_CHAMBER,
      payload: coord,
    })
  }

  const _mintFirst = () => {
    if (canMintFirst && gameId) {
      // const coord = makeEntryChamberId()
      const _level = levels[Math.floor(Math.random()*levels.length)]
      // console.log(_level)
      // start_level(account, gameId, 1, 0n, Dir.Under, 'entry', 0)
      start_level(account, gameId, 1, 0n, Dir.Under, _level.generatorName, _level.generatorValue)
    }
  }

  return (
    <div className='AlignTop'>
      <h2>
        Game #{gameId.toString()}
        {' '}
        <span className='Anchor' onClick={() => _setSelectedGame(gameId - 1)}>⏪️</span>
        <span className='Anchor' onClick={() => _setSelectedGame(gameId + 1)}>⏩️</span>
        {' '}
        <span className='Anchor' onClick={() => _setSelectedGame(Math.floor(Math.random() * 10000) + 1)}>🔄</span>
      </h2>

      {!chamberExists && <>
        <div>
          <button disabled={!canMintFirst} onClick={() => _mintFirst()}>Start New Game</button>
        </div>
        <br />
      </>}

      {chamberExists && <>
          {/* <b>{coordToSlug(chamberId, yonder)}</b>
          <br /> */}
          {bigintToHex(chamberId)}
        <br />
        Level: <b>{yonder}</b>
        <br />
        Light: <b>{light}%</b>
        <br />
        Health: <b>{health}%</b>
        <br />
        steps: <b>{stepCount}</b>

        <p><b>{message}</b></p>

      </>}

    </div>
  )
}

export default GameInfo
