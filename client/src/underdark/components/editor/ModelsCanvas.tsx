import { useState, useEffect, useRef } from 'react'
import { useGameplayContext } from '../../hooks/GameplayContext'
import * as game from './game'

export type ThreeJsGame = typeof game

const ModelsCanvas = ({
  width = 900,
  height = 700,
}) => {
  const { dispatch, GameplayActions } = useGameplayContext()
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const canvasRef = useRef()

  useEffect(() => {
    if (canvasRef.current && !isLoading) {
      console.log(`RESET CANVAS`)
      setIsLoading(true)
      game.init(canvasRef.current, width, height)
      game.animate()
      // game.resetGameParams(gameParams)
      setIsLoading(false)
      setIsInitialized(true)

      dispatch({
        type: GameplayActions.SET_GAME_LOOP,
        payload: game,
      })

      //@ts-ignore
      canvasRef.current.focus()
    }
    return () => {
      if (isInitialized) {
        game.dispose()
      }
    }
  }, [canvasRef.current])


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

export default ModelsCanvas
