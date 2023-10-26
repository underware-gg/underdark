import { useState, useRef } from 'react'
import { useEffectOnce } from '../hooks/useEffectOnce'
import { useGameplayContext } from '../hooks/GameplayContext'

export const ThreeJsCanvas = ({
  width = 900,
  height = 700,
  guiEnabled = false,
  gameLoop,
}) => {
  const { dispatch, GameplayActions } = useGameplayContext()
  const [isLoading, setIsLoading] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const canvasRef = useRef()

  useEffectOnce(() => {
    let _mounted = true
    const _initialize = async () => {
      await gameLoop.init(canvasRef.current, width, height, guiEnabled)
      if (!_mounted) return
      gameLoop.animate()
      // game.resetGameParams(gameParams)
      setIsLoading(false)
      setIsRunning(true)
      dispatch({
        type: GameplayActions.SET_GAME_LOOP,
        payload: gameLoop,
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
        gameLoop.dispose()
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

export default ThreeJsCanvas
