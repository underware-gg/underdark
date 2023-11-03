import { useUnderdarkContext } from '../../hooks/UnderdarkContext'
import { useChamber, useChamberOffset } from '../../hooks/useChamber'
import { Dir } from '../../utils/underdark'
import { Col, Grid, Row } from '../Grid'
import { PrevNextButton } from './UIButtons'

function LevelSelector() {
  const { chamberId } = useUnderdarkContext()
  const { yonder } = useChamber(chamberId)

  return (
    <Grid className='RowUI'>
      <Row stretched>
        <Col width={4} className='UI'>
          <NextLevelButton chamberId={chamberId} dir={Dir.Over} />
        </Col>
        <Col width={8} className='Padded'>
          <h3>
            Level {Math.max(yonder, 1)}
          </h3>
        </Col>
        <Col width={4} className='UI'>
          <NextLevelButton chamberId={chamberId} dir={Dir.Under} />
        </Col>
      </Row>
    </Grid>
  )
}


//-------------------
// Buttons
//

interface NextLevelButtonProps {
  chamberId: bigint
  dir: Dir
}

function NextLevelButton({
  chamberId,
  dir,
}: NextLevelButtonProps) {
  const { dispatch, UnderdarkActions } = useUnderdarkContext()
  const { locationId, chamberExists } = useChamberOffset(chamberId, dir)

  const _open = () => {
    dispatch({
      type: UnderdarkActions.SET_CHAMBER,
      payload: locationId,
    })
  }

  const direction = (dir == Dir.Over ? -1 : 1)

  return <PrevNextButton disabled={!chamberExists} direction={direction} onClick={() => _open()} />
}


export default LevelSelector
