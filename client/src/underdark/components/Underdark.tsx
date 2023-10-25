import { useSyncWorld } from '../hooks/useGraphQLQueries'
import { UnderdarkProvider } from '../hooks/UnderdarkContext'
import { GameplayProvider } from '../hooks/GameplayContext'
import MinterMap from './MinterMap'
// import MinterData from './MinterData'
import GameData from './GameData'
import GameView from './GameView'
import ScoreBoard from './ScoreBoard'
import { Container, Grid } from 'semantic-ui-react'

const Row = Grid.Row
const Col = Grid.Column

function Underdark() {
  const { loading } = useSyncWorld()

  if (loading) {
    return <h1>loading...</h1>
  }

  return (
    <UnderdarkProvider>
      <GameplayProvider>
        <div>

          <Grid className='MinterPanel'>
            <Row>
              <Col width={5}>
                <MinterMap />
              </Col>
              <Col width={6}>
                <GameData />
              </Col>
              <Col width={5}>
                <ScoreBoard />
              </Col>
            </Row>
          </Grid>

          <br />

          <div className="card">
            <GameView />
          </div>

        </div>
      </GameplayProvider>
    </UnderdarkProvider>
  )
}

export default Underdark
