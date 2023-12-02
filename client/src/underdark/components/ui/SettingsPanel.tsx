import { useMemo } from 'react'
import { useSettingsContext } from '@/underdark/hooks/SettingsContext'
import { Col, Grid, Row } from '@/underdark/components/Grid'
import { ActionButton } from '@/underdark/components/ui/UIButtons'

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


//-------------------
// Buttons
//

interface SettingsButtonProps {
  prefix: string
  name: string
  value: boolean
}

function SettingsButton({
  prefix,
  name,
  value,
}: SettingsButtonProps) {
  const { dispatch } = useSettingsContext()
  const _switch = () => {
    dispatch({
      type: name,
      payload: !value,
    })
  }
  return <ActionButton fill dimmed={!value} label={`${prefix} ${value ? 'ON' : 'OFF'}`} onClick={() => _switch()} />
}


export default SettingsPanel
