import { useUnderdarkContext } from '@/underdark/hooks/UnderdarkContext'
import { Col, Grid, Row } from '@/underdark/components/Grid'
import { PrevNextButton } from '@/underdark/components/ui/UIButtons'

export const MAX_GAMES = 10000

function RoomSelector() {
  const { roomId } = useUnderdarkContext()

  return (
    <Grid className='RowUI'>
      <Row stretched>
        <Col width={4} className='UI'>
          <NextRoomButton nextRoomId={roomId - 1} direction={-1} />
        </Col>
        <Col width={8} className='Padded'>
          <h3>
            Room {roomId}
          </h3>
        </Col>
        <Col width={4} className='UI'>
          <NextRoomButton nextRoomId={roomId + 1} direction={+1} />
        </Col>
      </Row>
    </Grid>
  )
}

function NextRoomButton({
  nextRoomId,
  direction,
}) {
  const { dispatchSetRoom } = useUnderdarkContext()
  const enabled = (nextRoomId >= 1 && nextRoomId <= MAX_GAMES)

  const _setSelectedRoom = () => {
    if (enabled) {
      dispatchSetRoom(nextRoomId)
    }
  }

  return <PrevNextButton direction={direction} disabled={!enabled} onClick={() => _setSelectedRoom()} />
}


export default RoomSelector
