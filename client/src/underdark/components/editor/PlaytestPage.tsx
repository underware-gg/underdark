import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Dir, FlippedDir, TileType, tilemapToGameTilemap } from '@/underdark/utils/underdark'
import { useGameplayContext } from '@/underdark/hooks/GameplayContext'
import { useKeyDown } from '@/underdark/hooks/useKeyDown'
import { LevelParams, levels } from '@/underdark/data/levels'
import { bigintToHex } from '@/underdark/utils/utils'
import GameCanvas from '@/underdark/components/GameCanvas'

function PlaytestPage() {
  const searchParams = useSearchParams()
  const bitmap = searchParams.get('bitmap')

  return (
    <div>
      <GameView bitmap={BigInt(bitmap ?? '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')} />
    </div>
  )
}


const GameView = ({
  bitmap
}) => {

  const tilemap = useMemo(() => {
    let result: TileType[] = []
    if (bitmap) {
      for (let i = 0; i < 256; ++i) {
        const bit = bitmap & (1n << BigInt(255 - i))
        result.push(i == 0 ? TileType.Entry : bit ? TileType.Path : TileType.Void)
      }
    }
    return result
  }, [bitmap])
  // useEffect(() => console.log(`tilemap:`, bigintToHex(bitmap), tilemap), [tilemap])

  const gameTilemap = useMemo(() => tilemapToGameTilemap(tilemap, 20), [tilemap])
  useEffect(() => console.log(`gameTilemap:`, bigintToHex(bitmap), gameTilemap), [gameTilemap])

  const { gameImpl, playerPosition, dispatchReset, dispatchMoveTo, dispatchTurnToDir } = useGameplayContext()

  useEffect(() => {
    console.log(` >>>>>>> gameTilemap`, gameTilemap)
    if (gameTilemap) {
      dispatchReset(gameTilemap.playerStart, true)
    }
  }, [gameTilemap])

  const directional = false
  useKeyDown(() => (directional ? _moveToDirection(Dir.East) : _rotate(1)), ['ArrowRight', 'd'])
  useKeyDown(() => (directional ? _moveToDirection(Dir.West) : _rotate(-1)), ['ArrowLeft', 'a'])
  useKeyDown(() => (directional ? _moveToDirection(Dir.North) : _move(1)), ['ArrowUp', 'w'])
  useKeyDown(() => (directional ? _moveToDirection(Dir.South) : _move(-1)), ['ArrowDown', 's'])

  const _moveToDirection = (dir) => {
    dispatchMoveTo({ dir, tilemap })
    dispatchTurnToDir(dir)
  }

  const _move = (signal) => {
    const dir = signal < 0 ? FlippedDir[playerPosition.facing] : playerPosition.facing
    dispatchMoveTo({ dir, tilemap })
  }

  const _rotate = (signal) => {
    const dir = (signal < 0 ? {
      [Dir.North]: Dir.West,
      [Dir.West]: Dir.South,
      [Dir.South]: Dir.East,
      [Dir.East]: Dir.North
    } : {
      [Dir.North]: Dir.East,
      [Dir.East]: Dir.South,
      [Dir.South]: Dir.West,
      [Dir.West]: Dir.North
    })[playerPosition.facing]
    dispatchTurnToDir(dir)
  }

  // level selector
  const _selectLevel = (level: LevelParams | null) => {
    const params = (level === null ? null : level.renderParams)
    gameImpl?.resetGameParams(params)
  }

  useEffect(() => {
    gameImpl?.setupMap(gameTilemap ?? null, true)
  }, [gameImpl, gameTilemap])

  useEffect(() => {
    gameImpl?.movePlayer(playerPosition.tile, playerPosition.facing)
    gameImpl?.rotatePlayer(playerPosition.facing)
  }, [gameImpl, playerPosition])


  return (
    <>
      <GameCanvas guiEnabled={true} />
      <br />
      {[null, ...levels].map((level: LevelParams | null, index: number) => {
        return (
          <div key={`level_${index}`} className='Anchor Padded Block' onClick={() => _selectLevel(level)} >{index}</div>
        )
      })}
    </>
  )
}

export default PlaytestPage
