import { Grid, Row, Col } from './Grid'
import { HealthBar, LightBar } from './ui/Bars'
import MapPanel from './ui/MapPanel'
import GamePanel from './ui/GamePanel'
import InfoPanel from './ui/InfoPanel'
import LevelSelector from './ui/LevelSelector'
import GameSelector from './ui/GameSelector'
import UICompass from './ui/UICompass'

function GameUI() {
  return (
    <Grid className='GameUI'>
      <Row>
        <Col width={4} className='NoPadding'>
          <GamePanel />
          <GameSelector />
          <LevelSelector />
        </Col>
        <Col width={1} className='UI'>
          <LightBar />
        </Col>
        <Col width={6} className='UI'>
          <InfoPanel />
          <UICompass />
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
