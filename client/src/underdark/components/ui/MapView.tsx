import { useMemo } from 'react'
import { Compass, Dir, GameTilemap, TileType, offsetCompass } from '../../utils/underdark'
import { MapColors } from '../../data/colors'
import { useGameplayContext } from '../../hooks/GameplayContext'

export interface Point {
  x: number
  y: number
}

export const compassToMapViewPos = (compass: Compass | null): Point => {
  // UNDERDARK SHIFT UNDER AS SOUTH
  for (let i = 0; i < compass.under - 1; ++i) {
    compass = offsetCompass(compass, Dir.South)
  }
  const north = (compass?.north ?? 0)
  const east = (compass?.east ?? 0)
  const west = (compass?.west ?? 0)
  const south = (compass?.south ?? 0)
  return {
    x: compass ? (east > 0 ? east : -west + 1) : 0,
    y: compass ? (south > 0 ? south : -north + 1) : 0,
  }
}

export interface MapChamber {
  coord: bigint
  compass: Compass | null
  mapPos: Point
  gameTilemap: GameTilemap
  exists: boolean
}

interface MapViewProps {
  targetChamber: MapChamber
  chambers: MapChamber[]
  tileSize?: number
  viewWidth?: number
  viewHeight?: number
}

//----------------------------
// Maps View
//
export function MapView({
  targetChamber,
  chambers,
  tileSize = 4,
  viewWidth = 240,
  viewHeight = 240,
}: MapViewProps) {

  if (!targetChamber?.gameTilemap) {
    return <></>
  }

  // view size in pixels
  const gridSize = targetChamber.gameTilemap.gridSize
  const chamberSize = tileSize * gridSize
  const strokeWidth = 1.0 / tileSize

  // viewbox unit is a <Map>
  const viewboxWidth = viewWidth / chamberSize
  const viewboxHeight = viewHeight / chamberSize
  const viewboxOrigin = {
    x: targetChamber.mapPos.x - ((viewboxWidth - 1) / 2),
    y: targetChamber.mapPos.y - ((viewboxHeight - 1) / 2),
  }

  return (
    <svg width={'100%'} height={'100%'} viewBox={`${viewboxOrigin.x} ${viewboxOrigin.y} ${viewboxWidth} ${viewboxHeight}`}>
      <style>{`svg{background-color:${MapColors.BG1}}`}</style>
      {chambers.map((chamber: MapChamber) => {
        const isTarget = (chamber.coord == targetChamber.coord && chamber.exists)
        return (
          <g key={`map_${chamber.coord.toString()}`} transform={`translate(${chamber.mapPos.x},${chamber.mapPos.y})`} >
            <Map targetChamber={chamber.gameTilemap} strokeWidth={strokeWidth} isTarget={isTarget} />
          </g>
        )
      })}
    </svg>
  )
}


//----------------------------
// Single Map
//
interface MapProps {
  targetChamber: GameTilemap
  strokeWidth: number
  isTarget: boolean
}
export function Map({
  targetChamber,
  strokeWidth,
  isTarget,
}: MapProps) {
  const { playerPosition } = useGameplayContext()

  const gridSize = targetChamber.gridSize
  const gridOrigin = targetChamber.gridOrigin

  const tiles = useMemo(() => {
    const result: any = []
    for (let i = 0; i < targetChamber.tilemap.length; ++i) {
      const key = `tile_${i}`
      const tileType = targetChamber.tilemap[i]
      const x = i % gridSize + gridOrigin.x
      const y = Math.floor(i / gridSize) + gridOrigin.y
      let tile = null
      let tileColor = null
      if (tileType == TileType.Void) {
        tileColor = MapColors.WALL
      } else if (tileType == TileType.Entry) {
        tileColor = MapColors.ENTRY
      } else if (tileType == TileType.Exit) {
        tileColor = MapColors.EXIT
      } else if (tileType == TileType.LockedExit) {
        tileColor = MapColors.LOCKED
      } else {
        // TileType.Path
      }
      if (!tile && !tileColor && (x + y) % 2 == 0) {
        tileColor = MapColors.BG2
      }
      if (!tile && tileColor) {
        tile = <rect
          key={key}
          x={x}
          y={y}
          width='1'
          height='1'
          fill={tileColor}
        // stroke='#8881'
        // strokeWidth={strokeWidth}
        />
      }
      if (tile) {
        result.push(tile)
      }
    }
    return result
  }, [targetChamber?.tilemap])

  const player = useMemo(() => {
    const result: any = []
    if (isTarget && playerPosition) {
      const x = playerPosition.tile % 16
      const y = Math.floor(playerPosition.tile / 16)
      result.push(<rect
        key='player_rect'
        x={x} y={y}
        width='1' height='1'
        fill={MapColors.PLAYER}
      />)
      const dir = playerPosition.facing
      result.push(<line
        key='player_line'
        x1={x + 0.5} y1={y + 0.5}
        x2={x + 0.5 + (dir == Dir.West ? -1 : dir == Dir.East ? 1 : 0)}
        y2={y + 0.5 + (dir == Dir.North ? -1 : dir == Dir.South ? 1 : 0)}
        stroke={MapColors.PLAYER}
        strokeWidth={0.2}
      />)
    }
    return result
  }, [isTarget, playerPosition])

  return (
    <svg width='1' height='1' viewBox={`${gridOrigin.x} ${gridOrigin.y} ${gridSize} ${gridSize}`}>
      {tiles}
      {player}
      {isTarget &&
        <rect
          x={gridOrigin.x} y={gridOrigin.y}
          width={gridSize} height={gridSize}
          fill='none' stroke={MapColors.CURRENT} strokeWidth={strokeWidth * 2}
        />
      }
    </svg>
  )
}
