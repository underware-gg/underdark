import { useUnderdarkContext } from '../../hooks/UnderdarkContext'
import { useChamber } from '../../hooks/useChamber'
import { Col, Grid, Row } from '../Grid'


function GameSelector() {
  const { gameId } = useUnderdarkContext()

  return (
    <Grid className='RowUI'>
      <Row stretched>
        <Col width={4} className='UI'>
          <NextGameButton nextGameId={gameId - 1} label='-' />
        </Col>
        <Col width={8} className='Padded'>
          <h3>
            Game #{gameId}
          </h3>
        </Col>
        <Col width={4} className='UI'>
          <NextGameButton nextGameId={gameId + 1} label='+' />
        </Col>
      </Row>
    </Grid>
  )
}

function NextGameButton({
  nextGameId,
  label,
}) {
  const { dispatch, UnderdarkActions } = useUnderdarkContext()
  const enabled = (nextGameId >= 1 && nextGameId <= 1000)

  const _setSelectedGame = () => {
    if (enabled) {
      dispatch({
        type: UnderdarkActions.SET_GAME,
        payload: nextGameId,
      })
    }
  }

  const _label = enabled ? label : ''
  const _className = enabled ? 'Unlocked' : 'Locked'

  return (
    <button className={`DirectionButton ${_className}`} disabled={!enabled} onClick={() => _setSelectedGame()}>{_label}</button>
  )
}


export default GameSelector
