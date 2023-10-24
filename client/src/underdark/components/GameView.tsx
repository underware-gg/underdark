import { useEffect, useRef, useState } from 'react'
import GameCanvas from './GameCanvas'
import { useUnderdarkContext } from '../hooks/UnderdarkContext'
import { useGameplayContext, GameplayActions, GameState } from '../hooks/GameplayContext'
import { useChamberMap } from '../hooks/useChamber'
import { useKeyDown } from '../hooks/useKeyDown'
import { Dir, FlippedDir, TileType } from '../utils/underdark'
import { useDojoAccount, useDojoSystemCalls } from '../../DojoContext'
import { bigintToHex, map } from '../utils/utils'
import ReactAudioPlayer from 'react-audio-player'
import { levels } from '../utils/levels'


const GameView = ({
  // width = 620,
  // height = 350,
}) => {

  const { chamberId } = useUnderdarkContext()
  const { gameTilemap } = useChamberMap(chamberId)
  const { gameLoop, light, gameState, dispatch } = useGameplayContext()

  //
  // Start game!
  useEffect(() => {
    if (gameTilemap) {
      dispatch({
        type: GameplayActions.RESET,
        payload: gameTilemap.playerStart,
      })
    }
  }, [gameTilemap])

  useEffect(() => {
    gameLoop?.resetGameParams(levels[Number(chamberId % BigInt(levels.length))].renderParams)
  }, [gameLoop, chamberId])

  useEffect(() => {
    gameLoop?.setGameParams({
      far: map(light, 0.0, 100.0, 1.6, 5.0),
    })
  }, [gameLoop, light])

  return (
    <div className='Relative GameView'>
      <GameControls />
      {gameState == GameState.Playing && <GameCanvas gameTilemap={gameTilemap} />}
      {gameState == GameState.Verifying && <GameProof />}
      {gameState == GameState.NoEnergy && <GameOver reason={'You died!!!'} />}
      {light > 0
        ? <ReactAudioPlayer
          src='/audio/music-ambient.mp3'
          autoPlay={true}
          loop={true}
        // volume={1}
        />
        : <ReactAudioPlayer
          src='/audio/sfx/slenderduck.mp3'
          autoPlay={true}
          loop={true}
        // volume={1}
        />
      }
      <GameTriggers />
    </div>
  )
}

const _isAround = (tilemap, tile, type) => {
  const x = tile % 16
  const y = Math.floor(tile / 16)
  if (x > 0 && tilemap[(x - 1) + (y) * 16] == type) return true
  if (x < 15 && tilemap[(x + 1) + (y) * 16] == type) return true
  if (y > 0 && tilemap[(x) + (y - 1) * 16] == type) return true
  if (y < 15 && tilemap[(x) + (y + 1) * 16] == type) return true
  return false
}

const GameTriggers = () => {
  const { chamberId } = useUnderdarkContext()
  const { tilemap } = useChamberMap(chamberId)
  const { light, gameState, playerPosition, stepCount, dispatch } = useGameplayContext()

  useEffect(() => {
    if (!playerPosition || gameState != GameState.Playing) return
    const { tile, facing } = playerPosition
    // console.log(`Player at:`, tile, tilemap[tile])
    //
    // Reached door
    if (tilemap[tile] == TileType.Exit && facing == Dir.East) {
      dispatch({
        type: GameplayActions.SET_STATE,
        payload: GameState.Verifying,
      })
    } else {
      if (tilemap[tile] == TileType.DarkTar) {
        dispatch({
          type: GameplayActions.REFILL_LIGHT,
          payload: 100,
        })
      }
      if (_isAround(tilemap, tile, TileType.Monster)) {
        dispatch({
          type: GameplayActions.DAMAGE,
          payload: 10,
        })
      }
    }
  }, [playerPosition])

  useEffect(() => {
    if (gameState == GameState.Playing && light == 0) {
      dispatch({
        type: GameplayActions.SET_MESSAGE,
        payload: 'No light! Beware the Slender Duck!',
      })
    }
  }, [light])

  useEffect(() => {
    if (gameState == GameState.Playing && stepCount == 0) {
      dispatch({
        type: GameplayActions.SET_STATE,
        payload: GameState.NoEnergy,
      })
    }
  }, [stepCount])

  return (
    <>
    </>
  )
}



//--------------------
// PROOF!!
//

const GameProof = () => {
  const { chamberId } = useUnderdarkContext()
  const { finish_level } = useDojoSystemCalls()
  const { account } = useDojoAccount()
  const { gameState, steps } = useGameplayContext()
  // const { gameState, steps, dispatch: dispatchGameplay } = useGameplayContext()

  // const { locationId, seed } = useChamberOffset(chamberId, dir)
  // const exists = useMemo(() => (seed > 0n), [seed, locationId])
  // const _mint = () => {
  //   start_level(account, gameId, yonder + 1, 0n, dir, generator.name, generator.value)
  // }
  // const _open = () => {
  //   dispatch({
  //     type: UnderdarkActions.SET_CHAMBER,
  //     payload: locationId,
  //   })
  // }

  const dataFetch = useRef(false)

  useEffect(() => {
    // avoid calling effect twice
    if (dataFetch.current) return
    dataFetch.current = true

    if(gameState == GameState.Verifying) {
      let proof = BigInt(0)
      steps.map((step, index) => {
        proof |= (BigInt(step.dir) << BigInt(index * 4))
      });
      console.log(`PROOF:`, bigintToHex(proof))
      finish_level(account, chamberId, proof, steps.length)
    }
  }, [])

  return (
    <div className='FillParent'>
      <br />
      <h2>You found the exit!</h2>
      <br />
      <h2>validating moves on-chain...</h2>
    </div>
  )
}



const GameOver = ({
  reason,
}) => {
  const { chamberId } = useUnderdarkContext()
  const { gameTilemap } = useChamberMap(chamberId)
  const { dispatch } = useGameplayContext()

  const _restart = () => {
    dispatch({
      type: GameplayActions.RESET,
      payload: gameTilemap.playerStart,
    })
  }

  return (
    <div className='FillParent'>
      <br />
      <br />
      <h2>{reason}</h2>
      <br />
      <h2><button onClick={() => _restart()}>RESTART</button></h2>
    </div>
  )
}




//--------------------
// Keyboard controller
//
const GameControls = () => {
  const { chamberId } = useUnderdarkContext()
  const { tilemap } = useChamberMap(chamberId)
  const { gameState, playerPosition, dispatch } = useGameplayContext()

  const directional = false
  useKeyDown(() => (directional ? _moveToDirection(Dir.East) : _rotate(1)), ['ArrowRight', 'd'])
  useKeyDown(() => (directional ? _moveToDirection(Dir.West) : _rotate(-1)), ['ArrowLeft', 'a'])
  useKeyDown(() => (directional ? _moveToDirection(Dir.North) : _move(1)), ['ArrowUp', 'w'])
  useKeyDown(() => (directional ? _moveToDirection(Dir.South) : _move(-1)), ['ArrowDown', 's'])

  const _moveToDirection = (dir) => {
    if (gameState != GameState.Playing) return;
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
    if (gameState != GameState.Playing) return;
    const dir = signal < 0 ? FlippedDir[playerPosition.facing] : playerPosition.facing
    dispatch({
      type: GameplayActions.MOVE_TO,
      payload: { dir, tilemap },
    })
  }

  const _rotate = (signal) => {
    if (gameState != GameState.Playing) return;
    const dir = signal < 0 ? { [Dir.North]: Dir.West, [Dir.West]: Dir.South, [Dir.South]: Dir.East, [Dir.East]: Dir.North }[playerPosition.facing]
      : { [Dir.North]: Dir.East, [Dir.East]: Dir.South, [Dir.South]: Dir.West, [Dir.West]: Dir.North }[playerPosition.facing]
    dispatch({
      type: GameplayActions.TURN_TO,
      payload: dir,
    })
  }

  return <></>
}

export default GameView
