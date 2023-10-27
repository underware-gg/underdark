import { useEffect } from 'react'
import { useDojoSystemCalls, useDojoAccount } from '../../../DojoContext'
import { useChamber, useGameChamberIds } from '../../hooks/useChamber'
import { useUnderdarkContext } from '../../hooks/UnderdarkContext'
import { Dir } from '../../utils/underdark'
import { bigintToHex } from '../../utils/utils'
import { levels } from '../../data/levels'
import { MAX_GAMES } from './GameSelector'
import ScoreBoard from './ScoreBoard'
// import { Account } from 'starknet'

function GamePanel() {
  const { gameId, chamberId, dispatch, UnderdarkActions } = useUnderdarkContext()
  const { chamberExists, yonder } = useChamber(chamberId)

  const { chamberIds } = useGameChamberIds(gameId)
  useEffect(() => {
    const coord = chamberIds.length > 0 ? chamberIds[chamberIds.length - 1] : 0n
    dispatch({
      type: UnderdarkActions.SET_CHAMBER,
      payload: coord,
    })
  }, [chamberIds])

  const _randomizeGame = () => {
    const newGameId = Math.floor(Math.random() * MAX_GAMES) + 1
    dispatch({
      type: UnderdarkActions.SET_GAME,
      payload: newGameId,
    })
  }

  return (
    <div className='GamePanel'>
      <h2>
        Game #{gameId.toString()}
        {' '}
        <span className='Anchor' onClick={() => _randomizeGame()}>🔄</span>
      </h2>

      {!chamberExists && <>
        <div>Game does not
          <br />
          exist yet!
        </div>
        <br />
        <GenerateGameButton />
      </>}

      {chamberExists && <>
        {/* <b>{coordToSlug(chamberId, yonder)}</b>
          <br /> */}
        {bigintToHex(chamberId)}
        <br />
        Level: <b>{yonder}</b>

        <ScoreBoard />

      </>}
    </div>
  )
}

//-----------------------------------
//
function GenerateGameButton() {
  const { generate_level } = useDojoSystemCalls()
  const { account } = useDojoAccount()

  const { gameId, chamberId } = useUnderdarkContext()
  const { chamberExists } = useChamber(chamberId)

  const canGenerateFirstLevel = (gameId > 0 && !chamberExists)

  const _generateFirstGameLevel = () => {
    if (canGenerateFirstLevel) {
      // const coord = makeEntryChamberId()
      const _level = levels[Math.floor(Math.random() * levels.length)]
      // console.log(_level)
      // generate_level(account, gameId, 1, 0n, Dir.Under, 'entry', 0)
      generate_level(account, gameId, 1, 0n, Dir.Under, _level.generatorName, _level.generatorValue)
    }
  }

  return (
    <button disabled={!canGenerateFirstLevel} onClick={() => _generateFirstGameLevel()}>GENERATE</button>
  )
}

export default GamePanel
