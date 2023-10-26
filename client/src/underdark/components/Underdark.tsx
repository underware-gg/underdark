import { useSyncWorld } from '../hooks/useGraphQLQueries'
import { UnderdarkProvider } from '../hooks/UnderdarkContext'
import { GameplayProvider } from '../hooks/GameplayContext'
import MinterMap from './MinterMap'
import GameData from './GameData'
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
              <Col width={4} className='UI'>
                <MinterMap />
              </Col>
              <Col width={6} className='UI'>
                <GameData />
              </Col>
              <Col width={5} className='UI'>
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
