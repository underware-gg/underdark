import { useEffect, useMemo, useState } from "react"
import { Entity, HasValue, Has, getComponentValue } from '@dojoengine/recs'
import { useComponentValue, useEntityQuery } from "@dojoengine/react"
import { getEntityIdFromKeys } from "@dojoengine/utils"
import { useDojoComponents, useDojoSystemCalls } from '@/dojo/DojoContext'
import { Dir, TileType, tilemapToGameTilemap, offsetCoord, coordToCompass } from "../utils/underdark"
import { bigintToEntity } from "../utils/utils"
import { Account, shortString } from 'starknet'


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

export const useAllRoomIds = () => {
  const { chamberIds } = useAllChamberIds()
  const roomIds = useMemo(() =>
    chamberIds.reduce<number[]>((acc, value) => {
      const { roomId } = coordToCompass(value)
      if (!acc.includes(roomId)) {
        acc.push(roomId)
      }
      return acc
    }, []).sort((a, b) => (a - b)), [chamberIds])
  return {
    roomIds,
  }
}

export const useRoomChamberIds = (roomId: number) => {
  const { Chamber } = useDojoComponents()
  const entityIds = useEntityQuery([HasValue(Chamber, { room_id: roomId })])
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
    chamberExists: seed > 0,
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

export const useChamberMapData = (locationId: bigint, bitmap: bigint = undefined) => {
  const { generate_map_data } = useDojoSystemCalls()
  const [mapData, setMapData] = useState(null)
  
  // console.warn(`useChamberMapData`, locationId)

  useEffect(() => {
    let _mounted = true
    const _fetch = async () => {
      const map_data = await generate_map_data(locationId);
      if (_mounted && map_data && Object.keys(map_data).length > 0) {
        setMapData(map_data)
      }
    }
    setMapData(null)
    if (locationId && (bitmap === undefined || bitmap > 0n)) {
      _fetch()
    }
    return () => {
      _mounted = false
    }
  }, [locationId, bitmap])

  return mapData
}

export const useChamberMap = (locationId: bigint, id: number = 0) => {
  const { Map, Tile } = useDojoComponents()
  const map: any = useComponentValue(Map, bigintToEntity(locationId))
  const bitmap = useMemo<bigint>(() => BigInt(map?.bitmap ?? 0n), [map])
  const map_data = useChamberMapData(locationId, bitmap)
  // useEffect(() => console.log(`useChamberMap:`, id, map, typeof map?.bitmap, bitmap), [bitmap])

  //
  // Parse tiles
  const tileIds: Entity[] = useEntityQuery([HasValue(Tile, { location_id: locationId ?? 0n })])
  const tiles: any[] = useMemo(() => tileIds.map((tileId) => getComponentValue(Tile, tileId)), [tileIds])
  // useEffect(() => console.log(`/tiles:`, coordToSlug(locationId), tileIds, tiles), [tileIds, tiles])

  //
  // Parse tilemap
  const tilemap = useMemo(() => {
    let result: number[] = []
    if (bitmap && tiles.length > 0 && map_data) {
      for (let i = 0; i < 256; ++i) {
        const bit = BigInt(255 - i)
        const isPath = (bitmap & (1n << bit)) != 0n
        const isMonster = (map_data.monsters & (1n << bit)) != 0n
        const isSlenderDuck = (map_data.slender_duck & (1n << bit)) != 0n
        const isDarkTar = (map_data.dark_tar & (1n << bit)) != 0n
        const isChest = (map_data.chest & (1n << bit)) != 0n
        // console.log(`GAMETILEMAP`, i, isPath, isMonster, isSlenderDuck, isDarkTar)
        if (isChest) {
          result.push(TileType.Chest)
          // console.log(`++++++TileType.Chest`, bit)
        } else if (isDarkTar) {
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
  }, [bitmap, tiles, map_data])
  // useEffect(() => console.log(`tilemap:`, bigintToHex(bitmap), tilemap), [tilemap])

  const gameTilemap = useMemo(() => { return tilemapToGameTilemap(tilemap, 20) }, [tilemap])
  // useEffect(() => console.log(`gameTilemap:`, id, locationId, gameTilemap), [gameTilemap])

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

export const useScoreByKey = (scoreKey: Entity) => {
  const { Score } = useDojoComponents()
  const score: any = useComponentValue(Score, scoreKey ?? '0' as Entity)
  // useEffect(() => console.log(`Account score:`, coordToSlug(score?.location_id ?? 0n), score), [score])
  return {
    location_id: score?.location_id ?? 0n,
    player: score?.player ?? 0n,
    playerName: score?.player_name ? shortString.decodeShortString(score.player_name) : '?',
    moves: score?.moves ?? 0,
    score: score?.score ?? 0,
    levelIsCompleted: (score?.score > 0),
    scoreKey,
  }
}

export const usePlayerScore = (chamberId: bigint, account: Account) => {
  const key = useMemo(() => getEntityIdFromKeys([chamberId, BigInt(account.address)]), [chamberId, account])
  return useScoreByKey(key)
}

