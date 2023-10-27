import { Grid, Row, Col } from './Grid'
import MapPanel from './ui/MapPanel'
import GameInfo from './ui/GameInfo'
import ScoreBoard from './ui/ScoreBoard'

function GameUI() {
  return (
    <Grid className='GameInfo'>
      <Row>
        <Col width={4} className='NoPadding'>
          <MapPanel />
        </Col>
        <Col width={1} className='UI'>
        </Col>
        <Col width={6} className='UI'>
          <GameInfo />
        </Col>
        <Col width={1} className='UI'>
        </Col>
        <Col width={4} className='UI'>
          <ScoreBoard />
        </Col>
      </Row>
    </Grid>
  )
}

export default GameUI
