import { useUnderdarkContext } from '../../hooks/UnderdarkContext'
import { useChamber } from '../../hooks/useChamber'
import { Col, Grid, Row } from '../Grid'
import { PrevNextButton } from './UIButtons'

export const MAX_GAMES = 10000

function GameSelector() {
  const { gameId } = useUnderdarkContext()

  return (
    <Grid className='RowUI'>
      <Row stretched>
        <Col width={4} className='UI'>
          <NextGameButton nextGameId={gameId - 1} direction={-1} />
        </Col>
        <Col width={8} className='Padded'>
          <h3>
            Game {gameId}
          </h3>
        </Col>
        <Col width={4} className='UI'>
          <NextGameButton nextGameId={gameId + 1} direction={+1} />
        </Col>
      </Row>
    </Grid>
  )
}

function NextGameButton({
  nextGameId,
  direction,
}) {
  const { dispatch, UnderdarkActions } = useUnderdarkContext()
  const enabled = (nextGameId >= 1 && nextGameId <= MAX_GAMES)

  const _setSelectedGame = () => {
    if (enabled) {
      dispatch({
        type: UnderdarkActions.SET_GAME,
        payload: nextGameId,
      })
    }
  }

  return <PrevNextButton direction={direction} disabled={!enabled} onClick={() => _setSelectedGame()} />
}


export default GameSelector
