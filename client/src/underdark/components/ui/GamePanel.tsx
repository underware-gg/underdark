import { useEffect } from 'react'
import { useChamber, useGameChamberIds } from '../../hooks/useChamber'
import { useUnderdarkContext } from '../../hooks/UnderdarkContext'
import { bigintToHex } from '../../utils/utils'
import { MAX_GAMES } from './GameSelector'
import ScoreBoard from './ScoreBoard'

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
    <div className='GamePanel Padded'>
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

export default GamePanel
