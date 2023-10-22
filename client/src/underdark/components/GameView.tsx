import { useEffect } from 'react'
import GameCanvas from './GameCanvas'
import { useUnderdarkContext } from '../hooks/UnderdarkContext'
import { useGameplayContext } from '../hooks/GameplayContext'
import { useChamberMap } from '../hooks/useChamber'
import { useKeyDown } from '../hooks/useKeyDown'
import { Dir, FlippedDir, TileType } from '../utils/underdark'
import { useDojoAccount, useDojoSystemCalls } from '../../DojoContext'
import { bigintToHex } from '../utils/utils'


const GameView = ({
  // width = 620,
  // height = 350,
}) => {

  const { chamberId } = useUnderdarkContext()
  const { gameTilemap } = useChamberMap(chamberId)
  const { gameState, dispatch, GameplayActions, GameState } = useGameplayContext()

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


  return (
    <div className='Relative GameView'>
      <GameControls />
      {gameState == GameState.Playing && <GameCanvas gameTilemap={gameTilemap} />}
      {gameState == GameState.Verifying && <GameProof />}
      <GameTriggers />
    </div>
  )
}


const GameTriggers = () => {
  const { chamberId } = useUnderdarkContext()
  const { tilemap } = useChamberMap(chamberId)
  const { playerPosition, dispatch, GameplayActions, GameState } = useGameplayContext()

  useEffect(() => {
    if (!playerPosition) return
    // Reached end
    const { tile, facing } = playerPosition
    console.log(`Player at:`, tile, tilemap[tile])
    if (tilemap[tile] == TileType.Exit && facing == Dir.East) {
      dispatch({
        type: GameplayActions.SET_STATE,
        payload: GameState.Verifying,
      })
    }

  }, [playerPosition])

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
  const { gameState, steps, GameState } = useGameplayContext()
  // const { gameState, steps, dispatch: dispatchGameplay, GameplayActions, GameState } = useGameplayContext()

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

  useEffect(() => {
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





//--------------------
// Keyboard controller
//
const GameControls = () => {
  const { chamberId } = useUnderdarkContext()
  const { tilemap } = useChamberMap(chamberId)
  const { gameState, playerPosition, dispatch, GameplayActions, GameState } = useGameplayContext()

  const directional = false
  useKeyDown(() => (directional ? _moveToDirection(Dir.East) : _rotate(1)), ['ArrowRight'])
  useKeyDown(() => (directional ? _moveToDirection(Dir.West) : _rotate(-1)), ['ArrowLeft'])
  useKeyDown(() => (directional ? _moveToDirection(Dir.North) : _move(1)), ['ArrowUp'])
  useKeyDown(() => (directional ? _moveToDirection(Dir.South) : _move(-1)), ['ArrowDown'])

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
