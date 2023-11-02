import { useUnderdarkContext } from '../../hooks/UnderdarkContext'
import { Col, Grid, Row } from '../Grid'
import { PrevNextButton } from './UIButtons'

export const MAX_GAMES = 10000

function RoomSelector() {
  const { roomId } = useUnderdarkContext()

  return (
    <Grid className='RowUI'>
      <Row stretched>
        <Col width={4} className='UI'>
          <NextGameButton nextRoomId={roomId - 1} direction={-1} />
        </Col>
        <Col width={8} className='Padded'>
          <h3>
            Room {roomId}
          </h3>
        </Col>
        <Col width={4} className='UI'>
          <NextGameButton nextRoomId={roomId + 1} direction={+1} />
        </Col>
      </Row>
    </Grid>
  )
}

function NextGameButton({
  nextRoomId,
  direction,
}) {
  const { dispatch, UnderdarkActions } = useUnderdarkContext()
  const enabled = (nextRoomId >= 1 && nextRoomId <= MAX_GAMES)

  const _setSelectedGame = () => {
    if (enabled) {
      dispatch({
        type: UnderdarkActions.SET_GAME,
        payload: nextRoomId,
      })
    }
  }

  return <PrevNextButton direction={direction} disabled={!enabled} onClick={() => _setSelectedGame()} />
}


export default RoomSelector
