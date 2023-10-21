
//-----------------------------------
// From Crawler SDK
//

import { Point } from "../components/MapView"

export enum Dir {
  North = 0,
  East = 1,
  West = 2,
  South = 3,
  Over = 4,
  Under = 5,
}

export const DirNames = {
  [Dir.North]: 'North',
  [Dir.East]: 'East',
  [Dir.West]: 'West',
  [Dir.South]: 'South',
  [Dir.Over]: 'Over',
  [Dir.Under]: 'Under',
}

export const FlippedDir = {
  [Dir.North]: Dir.South,
  [Dir.East]: Dir.West,
  [Dir.West]: Dir.East,
  [Dir.South]: Dir.North,
  [Dir.Over]: Dir.Under,
  [Dir.Under]: Dir.Over,
}

export enum TileType {
  Void = 0x00,
  Entry = 0x01,
  Exit = 0x02,
  LockedExit = 0x03,
  Gem = 0x04,
  HatchClosed = 0x05,
  HatchDown = 0x06,
  HatchUp = 0x07,
  Empty = 0xfe,
  Path = 0xff,
}

export interface Compass {
  gameId?: number,
  over?: number
  under?: number
  north?: number
  east?: number
  west?: number
  south?: number
}

export const validateCompass = (compass: Compass | null): boolean => {
  if (!compass) return false
  const hasNorth = (compass.north && compass.north > 0)
  const hasSouth = (compass.south && compass.south > 0)
  const hasEast = (compass.east && compass.east > 0)
  const hasWest = (compass.west && compass.west > 0)
  if ((hasNorth && hasSouth)
    || (!hasNorth && !hasSouth)
    || (hasEast && hasWest)
    || (!hasEast && !hasWest)
  ) return false
  return true
}

export const validatedCompass = (compass: Compass | null): Compass | null => {
  if (!compass || !validateCompass(compass)) {
    return null
  }
  let result = { ...compass }
  if (!result.over) delete result.over
  if (!result.under) delete result.under
  if (!result.north) delete result.north
  if (!result.east) delete result.east
  if (!result.west) delete result.west
  if (!result.south) delete result.south
  return result
}

export const slugSeparators = [null, '', ',', '.', ';', '-'] as const
export const defaultSlugSeparator = ','
export type SlugSeparator = typeof slugSeparators[number]

export const compassToSlug = (compass: Compass | null, yonder: number = 0, separator: SlugSeparator = defaultSlugSeparator): string => {
  if (!compass || !validateCompass(compass)) return ''
  let result = ''
  if (compass.gameId) {
    result += `#${compass.gameId}`
    if (separator) result += separator
  }
  if (compass.over || compass.under) {
    if (compass.over && compass.over > 0) result += `O${compass.over}`
    if (compass.under && compass.under > 0) result += `U${compass.under}`
    if (separator) result += separator
  }
  if (compass.north && compass.north > 0) result += `N${compass.north}`
  if (compass.south && compass.south > 0) result += `S${compass.south}`
  if (separator) result += separator
  if (compass.east && compass.east > 0) result += `E${compass.east}`
  if (compass.west && compass.west > 0) result += `W${compass.west}`
  if (yonder) {
    if (separator) result += separator
    result += `Y${yonder}`
  }
  return result
}

export const compassToCoord = (compass: Compass | null): bigint => {
  let result = 0n
  if (compass && validateCompass(compass)) {
    if (compass.gameId && compass.gameId > 0) result += BigInt(compass.gameId) << 96n
    if (compass.over && compass.over > 0) result += BigInt(compass.over) << 80n
    if (compass.under && compass.under > 0) result += BigInt(compass.under) << 64n
    if (compass.north && compass.north > 0) result += BigInt(compass.north) << 48n
    if (compass.east && compass.east > 0) result += BigInt(compass.east) << 32n
    if (compass.west && compass.west > 0) result += BigInt(compass.west) << 16n
    if (compass.south && compass.south > 0) result += BigInt(compass.south)
  }
  return result
}

export const coordToCompass = (coord: bigint): Compass | null => {
  let result: Compass = {
    gameId: Number((coord >> 96n) & BigInt(0xffffffff)),
    over: Number((coord >> 80n) & BigInt(0xffff)),
    under: Number((coord >> 64n) & BigInt(0xffff)),
    north: Number((coord >> 48n) & BigInt(0xffff)),
    east: Number((coord >> 32n) & BigInt(0xffff)),
    west: Number((coord >> 16n) & BigInt(0xffff)),
    south: Number(coord & BigInt(0xffff)),
  }
  return validatedCompass(result)
}

export const coordToSlug = (coord: bigint, yonder: number = 0): string => {
  return compassToSlug(coordToCompass(coord), yonder)
}

export const offsetCompass = (compass: Compass | null, dir: Dir): Compass | null => {
  const _add = (v: number | undefined) => (v ? v + 1 : 1)
  const _sub = (v: number | undefined) => (v && v > 1 ? v - 1 : 0)
  if (!compass) return null
  let result = { ...compass }
  if (dir == Dir.North) {
    result.south = _sub(result.south)
    if (!result.south) result.north = _add(result.north)
  } else if (dir == Dir.South) {
    result.north = _sub(result.north)
    if (!result.north) result.south = _add(result.south)
  } else if (dir == Dir.East) {
    result.west = _sub(result.west)
    if (!result.west) result.east = _add(result.east)
  } else if (dir == Dir.West) {
    result.east = _sub(result.east)
    if (!result.east) result.west = _add(result.west)
  } else if (dir == Dir.Over) {
    result.under = _sub(result.under)
    if (!result.under) result.over = _add(result.over)
  } else if (dir == Dir.Under) {
    result.over = _sub(result.over)
    if (!result.over) result.under = _add(result.under)
  }
  return validatedCompass(result)
}

export const offsetCoord = (coord: bigint, dir: Dir): bigint => {
  return compassToCoord(offsetCompass(coordToCompass(coord), dir))
}

//-----------------------------------
// Move to Crawler SDK
//

export const makeEntryChamberId = (): bigint => {
  const entryCoord = {
    south: 1,
    west: 1,
    over: 0,
    under: 0,
  }
  return compassToCoord(entryCoord)
}

export type TilemapGridSize = 18 | 20

export type Position = {
  tile: number,
  facing: Dir,
}

export type GameTilemap = {
  gridSize: TilemapGridSize
  gridOrigin: Point,
  playerStart: Position,
  tilemap: TileType[]
}

export const tilemapToGameTilemap = (tilemap: TileType[], gridSize: TilemapGridSize): GameTilemap | null => {
  if (tilemap.length != 256) return null
  return gridSize == 18 ? expandTilemap_18(tilemap)
    : gridSize == 20 ? expandTilemap_20(tilemap)
      : null
}

const _makePlayerStart = (tile: number) => {
  const x = tile % 16
  const y = Math.floor(tile / 16)
  return {
    tile: tile,
    facing: y == 0 ? Dir.South
      : y == 15 ? Dir.North
        : x == 0 ? Dir.East
          : x == 15 ? Dir.West
            : x < 8 ? Dir.South
              : Dir.North
  }
}

const expandTilemap_18 = (tilemap: TileType[]): GameTilemap => {
  const gridSize: TilemapGridSize = 18
  let playerStart: Position | null = null
  let result = Array(gridSize * gridSize).fill(tilemap.length > 0 ? TileType.Void : TileType.Path)
  const _set = (x: number, y: number, tileType: number) => { result[y * gridSize + x] = tileType }
  for (let i = 0; i < tilemap.length; ++i) {
    const tileType = tilemap[i]
    const x = i % 16
    const y = Math.floor(i / 16)
    let xx = x + 1
    let yy = y + 1
    if (tileType == TileType.Entry) {
      playerStart = _makePlayerStart(i)
    }
    if ([TileType.Entry, TileType.Exit, TileType.LockedExit].includes(tileType)) {
      if (x == 0) {
        _set(xx, yy, TileType.Path)
        _set(xx - 1, yy, tileType)
      } else if (x == 15) {
        _set(xx, yy, TileType.Path)
        _set(xx + 1, yy, tileType)
      } else if (y == 0) {
        _set(xx, yy, TileType.Path)
        _set(xx, yy - 1, tileType)
      } else if (y == 15) {
        _set(xx, yy, TileType.Path)
        _set(xx, yy + 1, tileType)
      } else {
        _set(xx, yy, tileType)
      }
    } else {
      _set(xx, yy, tileType)
    }
  }
  return {
    gridSize,
    gridOrigin: { x: -1, y: -1 },
    playerStart,
    tilemap: result,
  }
}

const expandTilemap_20 = (tilemap: TileType[]): GameTilemap => {
  const gridSize: TilemapGridSize = 20
  let playerStart: Position | null = null
  let result = Array(gridSize * gridSize).fill(tilemap.length > 0 ? TileType.Void : TileType.Path)
  const _set = (x: number, y: number, tileType: number) => { result[y * gridSize + x] = tileType }
  for (let i = 0; i < tilemap.length; ++i) {
    const tileType = tilemap[i]
    const x = i % 16
    const y = Math.floor(i / 16)
    let xx = x + 2
    let yy = y + 2
    if(tileType == TileType.Entry) {
      playerStart = _makePlayerStart(i)
    }
    if ([TileType.Entry, TileType.Exit, TileType.LockedExit].includes(tileType)) {
      if (x == 0) {
        _set(xx, yy, TileType.Path)
        _set(xx - 1, yy, tileType)
        _set(xx - 2, yy, TileType.Void)
        // _set(xx - 1, yy, TileType.Path)
        // _set(xx - 2, yy, tileType)
      } else if (x == 15) {
        _set(xx, yy, TileType.Path)
        _set(xx + 1, yy, tileType)
        _set(xx + 2, yy, TileType.Void)
        // _set(xx + 1, yy, TileType.Path)
        // _set(xx + 2, yy, tileType)
      } else if (y == 0) {
        _set(xx, yy, TileType.Path)
        _set(xx, yy - 1, tileType)
        _set(xx, yy - 2, TileType.Void)
        // _set(xx, yy - 1, TileType.Path)
        // _set(xx, yy - 2, tileType)
      } else if (y == 15) {
        _set(xx, yy, TileType.Path)
        _set(xx, yy + 1, tileType)
        _set(xx, yy + 2, TileType.Void)
        // _set(xx, yy + 1, TileType.Path)
        // _set(xx, yy + 2, tileType)
      } else {
        _set(xx, yy, tileType)
      }
    } else {
      _set(xx, yy, tileType)
    }
  }
  return {
    gridSize,
    gridOrigin: { x: -2, y: -2 },
    playerStart,
    tilemap: result,
  }
}

