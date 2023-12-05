import React from 'react'
import { Grid } from 'semantic-ui-react'
import { useGameplayContext } from '../hooks/GameplayContext'
import { NextLevelButton, StartButton } from '@/underdark/components/ui/Buttons'
import ScoreBoard from './ui/ScoreBoard'

const Row = Grid.Row
const Col = Grid.Column

function GameOver({
}) {
  const { isGameOver } = useGameplayContext()

  if (!isGameOver) {
    return <></>
  }

  return (
    <div className={`GameView Overlay CenteredContainer`}>
      <Grid textAlign='center'>
        <Row>
          <ScoreBoard />
        </Row>
        <Row>
          <NextLevelButton />
        </Row>
      </Grid>
    </div>
  )
}

export default GameOver
