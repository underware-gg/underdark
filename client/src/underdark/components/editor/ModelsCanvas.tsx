import { useState, useEffect, useRef } from 'react'
import { useGameplayContext } from '../../hooks/GameplayContext'
import { useEffectOnce } from '../../hooks/useEffectOnce'
import * as game from './game'

export type ThreeJsGame = typeof game


const ModelsCanvas = ({
  width = 900,
  height = 700,
}) => {
  const { dispatch, GameplayActions } = useGameplayContext()
  const [isLoading, setIsLoading] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const canvasRef = useRef()

  useEffectOnce(() => {
    let _mounted = true
    const _initialize = async () => {
      await game.init(canvasRef.current, width, height)
      if (!_mounted) return
      game.animate()
      // game.resetGameParams(gameParams)
      setIsLoading(false)
      setIsRunning(true)
      dispatch({
        type: GameplayActions.SET_GAME_LOOP,
        payload: game,
      })
      //@ts-ignore
      canvasRef.current.focus()
    }

    if (canvasRef.current && !isLoading && !isRunning) {
      setIsLoading(true)
      _initialize()
    }

    return () => {
      _mounted = false
      if (isRunning) {
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
