import { useEffect, useMemo } from 'react'
import MinterMap from './MinterMap'
import MinterData from './MinterData'
import { Dir, FlippedDir, TileType, tilemapToGameTilemap } from '../utils/underdark'
import { useGameplayContext } from '../hooks/GameplayContext'
import { useKeyDown } from '../hooks/useKeyDown'
import GameCanvas from './GameCanvas'
import { bigintToHex } from '../utils/utils'

// set index.html
//@ts-ignore
const _bitmap = BigInt(playtest_bitmap)

function PlaytestPage() {

  return (
    <div>
      {/* <div className="card MinterPanel">
        <MinterMap />
        <MinterData />
      </div>
      <br /> */}
      <div className="card MinterPanel">
        <GameView />
      </div>
    </div>
  )
}

const GameView = ({
  // width = 620,
  // height = 350,
}) => {

  const tilemap = useMemo(() => {
    let result: TileType[] = []
    if (_bitmap) {
      for (let i = 0; i < 256; ++i) {
        const bit = _bitmap & (BigInt(1) << BigInt(255 - i))
        result.push(i == 0 ? TileType.Entry : bit ? TileType.Path : TileType.Void)
      }
    }
    return result
  }, [_bitmap])
  // useEffect(() => console.log(`tilemap:`, bigintToHex(_bitmap), tilemap), [tilemap])

  const gameTilemap = useMemo(() => tilemapToGameTilemap(tilemap, 20), [tilemap])
  useEffect(() => console.log(`gameTilemap:`, bigintToHex(_bitmap), gameTilemap), [gameTilemap])

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
    <GameCanvas gameTilemap={gameTilemap} />
  )
}






export default PlaytestPage
