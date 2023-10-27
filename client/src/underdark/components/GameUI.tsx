import { Grid, Row, Col } from './Grid'
import { HealthBar, LightBar } from './ui/Bars'
import MapPanel from './ui/MapPanel'
import GamePanel from './ui/GamePanel'
import GameInfo from './ui/GameInfo'

function GameUI() {
  return (
    <Grid className='GamePanel'>
      <Row>
        <Col width={4} className='NoPadding'>
          <GamePanel />
        </Col>
        <Col width={1} className='UI'>
          <LightBar />
        </Col>
        <Col width={6} className='UI'>
          <GameInfo />
        </Col>
        <Col width={1} className='UI'>
          <HealthBar />
        </Col>
        <Col width={4} className='UI'>
          <MapPanel />
        </Col>
      </Row>
    </Grid>
  )
}

export default GameUI
