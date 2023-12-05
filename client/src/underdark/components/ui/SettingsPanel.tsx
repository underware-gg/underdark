import { useSettingsContext } from '@/underdark/hooks/SettingsContext'
import { Col, Grid, Row } from '@/underdark/components/Grid'
import { SettingsButton } from '@/underdark/components/ui/Buttons'

function SettingsPanel() {
  const { settings, SettingsActions } = useSettingsContext()

  return (
    <Grid className='RowUI'>
      <Row stretched>
        <Col width={8} className='UI'>
          <SettingsButton prefix='Music' name={SettingsActions.MUSIC_ENABLED} value={settings.musicEnabled} />
        </Col>
        <Col width={8} className='UI'>
          <SettingsButton prefix='SFX' name={SettingsActions.SFX_ENABLED} value={settings.sfxEnabled} />
        </Col>
      </Row>
    </Grid>
  )
}

export default SettingsPanel
