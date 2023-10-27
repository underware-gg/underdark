import { useSyncWorld } from '../hooks/useGraphQLQueries'
import { UnderdarkProvider } from '../hooks/UnderdarkContext'
import { GameplayProvider } from '../hooks/GameplayContext'
import MiniMap from './MiniMap'
import GameUI from './GameUI'
import GameView from './GameView'
import ScoreBoard from './ScoreBoard'
// import { Container } from 'semantic-ui-react'
import { Grid, Row, Col } from './Grid'

function Underdark() {
  const { loading } = useSyncWorld()

  if (loading) {
    return <h1>loading...</h1>
  }

  return (
    <UnderdarkProvider>
      <GameplayProvider>
        <div>

          <Grid className='GameUI'>
            <Row>
              <Col width={4} className='NoPadding'>
                <MiniMap />
              </Col>
              <Col width={1} className='UI'>
              </Col>
              <Col width={6} className='UI'>
                <GameUI />
              </Col>
              <Col width={1} className='UI'>
              </Col>
              <Col width={4} className='UI'>
                <ScoreBoard />
              </Col>
            </Row>
          </Grid>

          <br />

          <GameView />

        </div>
      </GameplayProvider>
    </UnderdarkProvider>
  )
}

export default Underdark
