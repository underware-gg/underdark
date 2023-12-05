import { useRouter } from 'next/navigation'
import { Col, Grid, Row } from '@/underdark/components/Grid'
import { ActionButton } from '@/underdark/components/ui/UIButtons'
import { StartButton } from '@/underdark/components/ui/Buttons'

function NavigationPanel() {
  const router = useRouter()

  const _gotoManor = () => {
    router.push('/manor')
  }

  return (
    <Grid className='RowUI'>
      <Row stretched>
        <Col width={8} className='UI'>
          <ActionButton fill label={'MANOR'} onClick={() => _gotoManor()} />
        </Col>
        <Col width={8} className='UI'>
          <StartButton fill />
        </Col>
      </Row>
    </Grid>
  )
}


export default NavigationPanel
