import { Grid, Row, Col } from '@/underdark/components/Grid'
import { HealthBar, LightBar } from '@/underdark/components/ui/Bars'
import MapPanel from '@/underdark/components/ui/MapPanel'
import RoomPanel from '@/underdark/components/ui/RoomPanel'
import InfoPanel from '@/underdark/components/ui/InfoPanel'
import LevelSelector from '@/underdark/components/ui/LevelSelector'
import RoomSelector from '@/underdark/components/ui/RoomSelector'
import UICompass from '@/underdark/components/ui/UICompass'
import SettingsPanel from '@/underdark/components/ui/SettingsPanel'
import NavigationPanel from '@/underdark/components/ui/NavigationPanel'

function GameUI() {
  return (
    <div className='GameView'>
      <Grid className='GameUITop'>
        <Row>
          <Col width={4} className='NoPadding'>
            <RoomPanel />
          </Col>
          <Col width={8} className='UI'>
          </Col>
          <Col width={4} className='UI'>
            <MapPanel />
          </Col>
        </Row>
      </Grid>

      <Grid className='GameUIBottom'>
        <Row>
          <Col width={4} className='NoPadding'>
            <div className='MapView'></div>
            {/* <RoomSelector /> */}
            {/* <LevelSelector /> */}
            <NavigationPanel />
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
            <div className='MapView'></div>
            <SettingsPanel />
          </Col>
        </Row>
      </Grid>
    </div>
  )
}

export default GameUI
