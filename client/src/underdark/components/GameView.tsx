import React, { useEffect } from 'react'
import { useDojoAccount, useDojoSystemCalls } from '@/dojo/DojoContext'
import { useGameplayContext, GameState } from '@/underdark/hooks/GameplayContext'
import { useChamber, useChamberMap } from '@/underdark/hooks/useChamber'
import { useKeyDown } from '@/underdark/hooks/useKeyDown'
import { useUnderdarkContext } from '@/underdark/hooks/UnderdarkContext'
import { Dir, FlippedDir, TileType } from '@/underdark/utils/underdark'
import { bigintToHex, map } from '@/underdark/utils/utils'
import { getLevelParams } from '@/underdark/data/levels'
import GameCanvas from '@/underdark/components/GameCanvas'
import { AudioName } from '@/underdark/data/assets'
import { useSettingsContext } from '@/underdark/hooks/SettingsContext'


const GameView = ({
  // width = 620,
  // height = 350,
}) => {

  const { roomId, chamberId } = useUnderdarkContext()
  const { tilemap, gameTilemap } = useChamberMap(chamberId)
  const { yonder } = useChamber(chamberId)
  const { gameImpl, isLoaded, isPlaying, playCount, hasLight, light, playerPosition, dispatchReset } = useGameplayContext()
  
  // Load map, set player start
  useEffect(() => {
    if (gameTilemap?.playerStart) {
      dispatchReset(gameTilemap?.playerStart ?? null, false)
    }
  }, [gameTilemap, roomId, chamberId])

  useEffect(() => {
    gameImpl?.resetGameParams(getLevelParams(yonder).renderParams)
  }, [gameImpl, chamberId, yonder])

  useEffect(() => {
    gameImpl?.setLightLevel(light / 100.0);
  }, [gameImpl, light])

  useEffect(() => {
    if (isLoaded) {
      gameImpl?.setupMap(gameTilemap ?? null, false)
    }
  }, [gameImpl, gameTilemap, isLoaded])

  // game Start
  useEffect(() => {
    if (isPlaying) {
      gameImpl?.enableTilesByType(TileType.DarkTar, true)
      gameImpl?.enableTilesByType(TileType.Chest, true)
    }
  }, [gameImpl, isPlaying, playCount])

  useEffect(() => {
    if (isPlaying) {
      if (hasLight) {
        gameImpl?.enableTilesByType(TileType.Monster, true)
        gameImpl?.enableTilesByType(TileType.SlenderDuck, false)
      } else {
        gameImpl?.enableTilesByType(TileType.Monster, false)
        gameImpl?.enableTilesByType(TileType.SlenderDuck, true)
      }
    }
  }, [gameImpl, isPlaying, hasLight, playCount])

  return (
    <div className='Relative GameView'>
      <MovePlayer />
      <GameCanvas guiEnabled={false} />
      <GameLoop tilemap={tilemap} />
      <GameControls tilemap={tilemap} />
      <GameAudios />
    </div>
  )
}


const MovePlayer = () => {
  const { roomId, chamberId } = useUnderdarkContext()
  const { gameImpl, isLoaded, isPlaying, playerPosition } = useGameplayContext()

  useEffect(() => {
    if (isLoaded || isPlaying) {
      gameImpl?.movePlayer(playerPosition?.tile ?? null, playerPosition?.facing ?? null)
    }
  }, [gameImpl, roomId, chamberId, isLoaded, isPlaying, playerPosition?.tile])

  useEffect(() => {
    gameImpl?.rotatePlayer(playerPosition?.facing ?? null)
  }, [gameImpl, roomId, chamberId, isLoaded, isPlaying, playerPosition?.facing])

  return <></>
}


const _isAround = (tilemap, tile, type): number | undefined => {
  const x = tile % 16
  const y = Math.floor(tile / 16)
  if (x > 0) {
    const i = (x - 1) + y * 16
    if (tilemap[i] == type) return i
  }
  if (x < 15) {
    const i = (x + 1) + y * 16
    if (tilemap[i] == type) return i
  }
  if (y > 0) {
    const i = x + (y - 1) * 16
    if (tilemap[i] == type) return i
  }
  if (y < 15) {
    const i = x + (y + 1) * 16
    if (tilemap[i] == type) return i
  }
  return undefined
}

const GameLoop = ({
  tilemap,
}) => {
  const { chamberId } = useUnderdarkContext()
  const { sfxEnabled } = useSettingsContext()
  const {
    gameImpl, gameState, isPlaying, playerPosition, light, hasLight, health, stepCount, steps,
    dispatchGameState, dispatchMessage, dispatchHitDamage, dispatchNearDamage, dispatchDarkTar, dispatchSlendered, dispatchTurnToDir, dispatchTurnToTile,
  } = useGameplayContext()

  // Main game loop
  useEffect(() => {
    if (!isPlaying || !playerPosition) return
    const { tile, facing } = playerPosition

    //
    // Dark tar recharge has preference (to Slenderduck)
    // come back to process the move
    //
    if (tilemap[tile] == TileType.DarkTar) {
      if (gameImpl?.isTileEnaled(tile)) {
        gameImpl?.disableTile(tile)
        gameImpl?.playAudio(AudioName.DARK_TAR, sfxEnabled)
        dispatchDarkTar(100)
        return;
      }
    }
    
    //
    // Messages
    //
    if (!hasLight) {
      dispatchMessage('No light! Beware the Slender Duck!')
    }

    //
    // End-game situations
    //
    if (tilemap[tile] == TileType.Exit) {
      dispatchGameState(GameState.Verifying)
      dispatchTurnToDir(Dir.South)
    } else if (health == 0) {
      dispatchGameState(GameState.NoHealth)
    } else if (isPlaying && stepCount == 64) {
      dispatchSlendered()
    } else {
      //
      // Process movement
      //
      const chestAround = _isAround(tilemap, tile, TileType.Chest)
      const monsterAround = _isAround(tilemap, tile, TileType.Monster)
      const slenderAround = _isAround(tilemap, tile, TileType.SlenderDuck)
      if (chestAround != null) {
        gameImpl?.rotatePlayerTo(chestAround)
        dispatchTurnToTile(tile)
        // gameImpl?.playAudio(AudioName.MONSTER_HIT, sfxEnabled)
        dispatchGameState(GameState.Verifying)
      } else if (!hasLight && (tilemap[tile] == TileType.SlenderDuck || slenderAround != null)) {
        gameImpl?.damageFromTile(slenderAround ?? tile)
        gameImpl?.rotateToPlayer(slenderAround ?? tile)
        gameImpl?.rotatePlayerTo(slenderAround ?? tile)
        dispatchTurnToTile(tile)
        gameImpl?.playAudio(AudioName.MONSTER_HIT, sfxEnabled)
        dispatchSlendered()
      } else if (hasLight && tilemap[tile] == TileType.Monster) {
        gameImpl?.damageFromTile(tile)
        gameImpl?.playAudio(AudioName.MONSTER_HIT, sfxEnabled)
        dispatchHitDamage()
      } else if (hasLight && monsterAround != null) {
        gameImpl?.damageFromTile(monsterAround)
        gameImpl?.rotateToPlayer(monsterAround)
        gameImpl?.playAudio(AudioName.MONSTER_TOUCH, sfxEnabled)
        dispatchNearDamage()
      }
    }
  }, [gameState, playerPosition?.tile, stepCount, light])

  //----------------------------------
  // Verify moves on-chain
  //
  const { finish_level } = useDojoSystemCalls()
  const { account } = useDojoAccount()
  useEffect(() => {
    const proofLostGames = (process.env.PROOF_LOST_GAMES && (gameState == GameState.NoHealth || gameState == GameState.Slendered))
    if (gameState == GameState.Verifying || proofLostGames) {
      let proof = 0n
      steps.map((step, index) => {
        proof |= (BigInt(step.dir) << BigInt(index * 4))
      });
      console.log(`PROOF:`, bigintToHex(proof))
      const success = finish_level(account, chamberId, proof, steps.length)
      if (success && gameState == GameState.Verifying) {
        dispatchGameState(success ? GameState.Verified : GameState.NotVerified)
      }
    }
  }, [gameState])

  return  <></>
}


const GameAudios = () => {
  const { musicEnabled, sfxEnabled} = useSettingsContext()
  const { gameImpl, gameState, playCount, isPlaying, isGameOver, hasLight, playerPosition } = useGameplayContext()

  useEffect(() => {
    const _play = (isGameOver && musicEnabled)
    gameImpl?.playAudio(AudioName.AMBIENT, _play)
  }, [isGameOver, musicEnabled])

  useEffect(() => {
    const _play = (isPlaying && sfxEnabled)
    if (hasLight) {
      gameImpl?.playAudio(AudioName.TORCH, _play)
      gameImpl?.stopAudio(AudioName.SLENDER_DUCK)
    } else {
      gameImpl?.stopAudio(AudioName.TORCH)
      gameImpl?.playAudio(AudioName.EXTINGUISH, _play)
      gameImpl?.playAudio(AudioName.SLENDER_DUCK, _play)
    }
  }, [isPlaying, hasLight, sfxEnabled])

  useEffect(() => {
    if (isPlaying && sfxEnabled) {
      gameImpl?.playFootstep()
    }
  }, [playerPosition?.tile])

  useEffect(() => {
    if (gameState == GameState.Verifying) {
      gameImpl?.playAudio(AudioName.STAIRS, sfxEnabled)
    }
  }, [gameState])

  useEffect(() => {
    gameImpl?.playAudio(AudioName.STAIRS, sfxEnabled)
    gameImpl?.fadeInLight()
    gameImpl?.rotatePlayer()
  }, [playCount])

  return <></>
}

//--------------------
// Keyboard controller
//
const GameControls = ({
  tilemap,
}) => {
  const { isPlaying, playerPosition, dispatchMoveTo, dispatchTurnToDir } = useGameplayContext()

  const directional = false
  useKeyDown(() => (directional ? _moveToDirection(Dir.East) : _rotate(1)), ['ArrowRight', 'd'])
  useKeyDown(() => (directional ? _moveToDirection(Dir.West) : _rotate(-1)), ['ArrowLeft', 'a'])
  useKeyDown(() => (directional ? _moveToDirection(Dir.North) : _move(1)), ['ArrowUp', 'w'])
  useKeyDown(() => (directional ? _moveToDirection(Dir.South) : _move(-1)), ['ArrowDown', 's'])

  const _moveToDirection = (dir) => {
    if (!isPlaying) return;
    dispatchMoveTo({ dir, tilemap })
    dispatchTurnToDir(dir)
  }

  const _move = (signal) => {
    if (!isPlaying) return;
    const dir = signal < 0 ? FlippedDir[playerPosition.facing] : playerPosition.facing
    dispatchMoveTo({ dir, tilemap })
  }

  const _rotate = (signal) => {
    if (!isPlaying) return;
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

  return <></>
}

export default GameView
