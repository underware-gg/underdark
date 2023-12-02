import { Grid, Row, Col } from '@/underdark/components/Grid'
import { HealthBar, LightBar } from '@/underdark/components/ui/Bars'
import MapPanel from '@/underdark/components/ui/MapPanel'
import RoomPanel from '@/underdark/components/ui/RoomPanel'
import InfoPanel from '@/underdark/components/ui/InfoPanel'
import LevelSelector from '@/underdark/components/ui/LevelSelector'
import RoomSelector from '@/underdark/components/ui/RoomSelector'
import UICompass from '@/underdark/components/ui/UICompass'
import SettingsPanel from '@/underdark/components/ui/SettingsPanel'

function GameUI() {
  return (
    <Grid className='GameUI'>
      <Row>
        <Col width={4} className='NoPadding'>
          <RoomPanel />
          <RoomSelector />
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
          <SettingsPanel />
        </Col>
      </Row>
    </Grid>
  )
}

export default GameUI
