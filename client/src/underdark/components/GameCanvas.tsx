import React, { useState, useEffect, useRef } from 'react'
import * as game from '../three/game'
import { useChamberMap } from '../hooks/useChamber'
import { useUnderdarkContext } from '../hooks/UnderdarkContext'

const GameCanvas = ({
  width = 620,
  height = 350,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const canvasRef = useRef()

  useEffect(() => {
    if (canvasRef.current && !isLoading) {
      setIsLoading(true)
      game.init(canvasRef.current, width, height)
      game.animate()
      setIsLoading(false)
      setIsInitialized(true)
      //@ts-ignore
      canvasRef.current.focus()
    }
  }, [canvasRef.current])

  const { chamberId } = useUnderdarkContext()
  const { bitmap, expandedTilemap } = useChamberMap(chamberId)

  useEffect(() => {
    if (isInitialized && bitmap) {
      game.setupMap(expandedTilemap)
    }
  }, [isInitialized, bitmap, expandedTilemap])

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
