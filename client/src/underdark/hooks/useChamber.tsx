import { useEffect, useMemo } from "react"
import { Entity, HasValue, Has, getComponentValue } from '@latticexyz/recs'
import { useComponentValue, useEntityQuery } from "@latticexyz/react"
import { useDojoComponents } from '../../DojoContext'
import { bigintToEntity, bigintToHex } from "../utils/utils"
import { Dir, TileType, tilemapToGameTilemap, offsetCoord, coordToSlug } from "../utils/underdark"
import { Account } from "starknet"
import { getEntityIdFromKeys } from "../../utils/utils"


//------------------
// All Chambers
//

export const useAllChamberIds = () => {
  const { Chamber } = useDojoComponents()
  const entityIds: Entity[] = useEntityQuery([Has(Chamber)])
  const chamberIds: bigint[] = useMemo(() => (entityIds ?? []).map((entityId) => BigInt(entityId)), [entityIds])
  return {
    chamberIds,
  }
}

export const useGameChamberIds = (gameId: number) => {
  const { Chamber } = useDojoComponents()
  const entityIds = useEntityQuery([HasValue(Chamber, { game_id: gameId })])
  const chamberIds: bigint[] = useMemo(() => (entityIds ?? []).map((entityId) => BigInt(entityId)), [entityIds])
  return {
    chamberIds,
  }
}


//------------------
// Single Chamber
//

export const useChamber = (chamberId: bigint) => {
  const { Chamber } = useDojoComponents()

  const chamber: any = useComponentValue(Chamber, bigintToEntity(chamberId))
  const seed = useMemo(() => BigInt(chamber?.seed ?? 0), [chamber])
  const minter = useMemo(() => BigInt(chamber?.minter ?? 0), [chamber])

  return {
    seed,
    minter,
    domain_id: chamber?.domain_id ?? 0,
    token_id: chamber?.token_id ?? 0,
    yonder: chamber?.yonder ?? 0,
  }
}

export const useChamberOffset = (chamberId: bigint, dir: Dir) => {
  const locationId = useMemo(() => offsetCoord(chamberId, dir), [chamberId, dir])
  const result = useChamber(locationId)
  return {
    locationId,
    ...result,
  }
}

export const useChamberMap = (locationId: bigint) => {
  const { Map, Tile } = useDojoComponents()
  const map: any = useComponentValue(Map, bigintToEntity(locationId))
  const bitmap: bigint = useMemo(() => BigInt(map?.bitmap ?? 0), [map])
  const monsters: bigint = useMemo(() => BigInt(map?.monsters ?? 0), [map])
  const slender_duck: bigint = useMemo(() => BigInt(map?.slender_duck ?? 0), [map])
  const dark_tar: bigint = useMemo(() => BigInt(map?.dark_tar ?? 0), [map])
  // useEffect(() => console.log(`map:`, map, typeof map?.bitmap, bitmap), [bitmap])

  //
  // Parse tiles
  const tileIds: Entity[] = useEntityQuery([HasValue(Tile, { location_id: locationId ?? 0n })])
  const tiles: any[] = useMemo(() => tileIds.map((tileId) => getComponentValue(Tile, tileId)), [tileIds])
  // useEffect(() => console.log(`tileIds:`, coordToSlug(locationId), tileIds), [tileIds])

  //
  // Parse tilemap
  const tilemap = useMemo(() => {
    let result: number[] = []
    if (bitmap && tiles.length > 0) {
      for (let i = 0; i < 256; ++i) {
        const bit = BigInt(255 - i)
        const isPath = (bitmap & (1n << bit)) != 0n
        const isMonster = (monsters & (1n << bit)) != 0n
        const isSlenderDuck = (slender_duck & (1n << bit)) != 0n
        const isDarkTar = (dark_tar & (1n << bit)) != 0n
        // console.log(`GAMETILEMAP`, i, isPath, isMonster, isSlenderDuck, isDarkTar)
        if (isDarkTar) {
          result.push(TileType.DarkTar)
          // console.log(`++++++TileType.DarkTar`, bit)
        } else if (isSlenderDuck) {
          result.push(TileType.SlenderDuck)
          // console.log(`++++++TileType.SlenderDuck`, bit)
        } else if (isMonster) {
          result.push(TileType.Monster)
          // console.log(`++++++TileType.Monster`, bit)
        } else if (!isPath) {
          result.push(TileType.Void)
        } else {
          result.push(TileType.Path)
        }
      }
      tiles.forEach((tile) => {
        result[tile.pos] = tile.tile_type
      })
    }
    return result
  }, [bitmap, tiles])
  // useEffect(() => console.log(`tilemap:`, bigintToHex(bitmap), tilemap), [tilemap])

  const gameTilemap = useMemo(() => tilemapToGameTilemap(tilemap, 20), [tilemap])
  // useEffect(() => console.log(`gameTilemap:`, gameTilemap), [gameTilemap])

  return {
    bitmap,
    tilemap,
    gameTilemap,
    doors: {
      north: map?.north ?? 0,
      east: map?.east ?? 0,
      west: map?.west ?? 0,
      south: map?.south ?? 0,
      over: map?.over ?? 0,
      under: map?.under ?? 0,
    }
  }
}

export const useChamberState = (chamberId: bigint) => {
  const { State } = useDojoComponents()
  const state: any = useComponentValue(State, bigintToEntity(chamberId))
  return state ?? {}
}


//---------------------
// Scores
//

export const useLevelScores = (chamberId: bigint) => {
  const { Score } = useDojoComponents()
  const scoreKeys = useEntityQuery([HasValue(Score, { location_id: chamberId ?? 0n })])
  // useEffect(() => console.log(`Level scores:`, coordToSlug(chamberId ?? 0n) , scoreKeys), [scoreKeys])
  return {
    scoreKeys,
  }
}

export const useScoreByKey = (key: Entity) => {
  const { Score } = useDojoComponents()
  const score: any = useComponentValue(Score, key ?? '0' as Entity)
  useEffect(() => console.log(`Account score:`, coordToSlug(score?.location_id ?? 0n), score), [score])
  return {
    location_id: score?.location_id ?? 0n,
    player: score?.player ?? 0n,
    moves: score?.moves ?? 0,
    levelClear: (score?.moves > 0),
  }
}

export const usePlayerScore = (chamberId: bigint, account: Account) => {
  const key = useMemo(() => getEntityIdFromKeys([chamberId, BigInt(account.address)]), [chamberId, account])
  return useScoreByKey(key)
}

