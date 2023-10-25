import { useState, useEffect, useRef } from 'react'
import * as game from '../three/game'
import { useGameplayContext } from '../hooks/GameplayContext'

export type ThreeJsGame = typeof game

const GameCanvas = ({
  width = 900,
  height = 450,
  gameTilemap,
  // gameParams = {} as any,
  guiEnabled = false,
}) => {
  const { playerPosition, dispatch, GameplayActions } = useGameplayContext()
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const canvasRef = useRef()

  useEffect(() => {
    dispatch({
      type: GameplayActions.SET_GAME_LOOP,
      payload: game,
    })
  }, [])

  useEffect(() => {
    if (canvasRef.current && !isLoading) {
      console.log(`RESET CANVAS`)
      setIsLoading(true)
      game.init(canvasRef.current, width, height, guiEnabled)
      game.animate()
      // game.resetGameParams(gameParams)
      setIsLoading(false)
      setIsInitialized(true)
      //@ts-ignore
      canvasRef.current.focus()
    }
    return () => {
      if (isInitialized) {
        game.dispose()
      }
    }
  }, [canvasRef.current])

  useEffect(() => {
    if (isInitialized && gameTilemap) {
      game.movePlayer(playerPosition)
    }
  }, [isInitialized, playerPosition])


  useEffect(() => {
    if (isInitialized && gameTilemap) {
      game.setupMap(gameTilemap)
    }
  }, [isInitialized, gameTilemap])

return (
  <canvas
    id='gameCanvas'
    className='GameCanvas'
    ref={canvasRef}
    width={width * 2}
    height={height * 2}
  >
    Canvas not supported by your browser.
  </canvas>
)
}

export default GameCanvas
