import React, { useState, useEffect, useRef } from 'react'
import GameCanvas from './GameCanvas'
import { useUnderdarkContext } from '../hooks/UnderdarkContext'
import { useGameplayContext } from '../hooks/GameplayContext'
import { useChamberMap } from '../hooks/useChamber'
import { useKeyDown } from '../hooks/useKeyDown'
import { Dir, FlippedDir } from '../utils/underdark'


const GameView = ({
  // width = 620,
  // height = 350,
}) => {

  const { chamberId } = useUnderdarkContext()
  const { tilemap, gameTilemap } = useChamberMap(chamberId)
  const { playerPosition, dispatch, GameplayActions } = useGameplayContext()

  useEffect(() => {
    if (gameTilemap) {
      dispatch({
        type: GameplayActions.RESET,
        payload: gameTilemap.playerStart
      })
    }
  }, [gameTilemap])

  const directional = false

  useKeyDown(() => (directional ? _moveToDirection(Dir.East) : _rotate(1)), ['ArrowRight'])
  useKeyDown(() => (directional ? _moveToDirection(Dir.West) : _rotate(-1)), ['ArrowLeft'])
  useKeyDown(() => (directional ? _moveToDirection(Dir.North) : _move(1)), ['ArrowUp'])
  useKeyDown(() => (directional ? _moveToDirection(Dir.South) : _move(-1)), ['ArrowDown'])

  const _moveToDirection = (dir) => {
    dispatch({
      type: GameplayActions.MOVE_TO,
      payload: { dir, tilemap },
    })
    dispatch({
      type: GameplayActions.TURN_TO,
      payload: dir,
    })
  }

  const _move = (signal) => {
    const dir = signal < 0 ? FlippedDir[playerPosition.facing] : playerPosition.facing
    dispatch({
      type: GameplayActions.MOVE_TO,
      payload: { dir, tilemap },
    })
  }

  const _rotate = (signal) => {
    const dir = signal < 0 ? { [Dir.North]: Dir.West, [Dir.West]: Dir.South, [Dir.South]: Dir.East, [Dir.East]: Dir.North }[playerPosition.facing]
      : { [Dir.North]: Dir.East, [Dir.East]: Dir.South, [Dir.South]: Dir.West, [Dir.West]: Dir.North }[playerPosition.facing]
    dispatch({
      type: GameplayActions.TURN_TO,
      payload: dir,
    })
  }

  return (
    <GameCanvas />
  )
}

export default GameView
