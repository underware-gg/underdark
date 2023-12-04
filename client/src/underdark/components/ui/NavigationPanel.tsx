import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useSettingsContext } from '@/underdark/hooks/SettingsContext'
import { Col, Grid, Row } from '@/underdark/components/Grid'
import { ActionButton } from '@/underdark/components/ui/UIButtons'
import { StartButton } from '@/underdark/components/ui/Buttons'

function NavigationPanel() {
  const router = useRouter()
  const { settings, SettingsActions } = useSettingsContext()

  return (
    <Grid className='RowUI'>
      <Row stretched>
        <Col width={8} className='UI'>
          <ActionButton fill label={'MANOR'} onClick={() => router.push('/manor')} />
        </Col>
        <Col width={8} className='UI'>
          <StartButton fill />
        </Col>
      </Row>
    </Grid>
  )
}


export default NavigationPanel
