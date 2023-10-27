import { useEffect, useState } from 'react'
import { useUnderdarkContext } from '../../hooks/UnderdarkContext'
import { useChamber, useChamberMap } from '../../hooks/useChamber'
import { MapChamber, MapView, compassToMapViewPos } from './MapView'
import { Dir, coordToCompass, coordToSlug, offsetCoord } from '../../utils/underdark'
import LevelSelector from './LevelSelector'


//-----------------------------
// Entry Point
//
function MapPanel() {
  const [tileSize, seTtileSize] = useState(7)
  const { gameId, chamberId: currentChamberId } = useUnderdarkContext()
  const { yonder } = useChamber(currentChamberId)

  useEffect(() => {
    setLoaders([])
    setChambers({})
  }, [gameId])

  useEffect(() => {
    if (currentChamberId > 0) {
      _addLoaders([currentChamberId])
    }
  }, [currentChamberId])

  // tilemap loaders
  const [loaders, setLoaders] = useState<bigint[]>([])
  const _addLoaders = (chamberIds: bigint[]) => {
    let newLoaders = []
    chamberIds.forEach(chamberId => {
      if (!loaders.includes(chamberId)) {
        newLoaders.push(chamberId)
      }
    });
    if(newLoaders.length > 0) {
      setLoaders([...loaders, ...newLoaders])
    }
  }

  // loaded tilemaps
  const [chambers, setChambers] = useState<{ [key: string]: MapChamber }>({})
  const _addChamber = (chamber: MapChamber) => {
    const _key = coordToSlug(chamber.coord)
    if (!chambers[_key]) {
      setChambers({
        ...chambers,
        [_key]: chamber,
      })
      _addLoaders([
        offsetCoord(chamber.coord, Dir.North),
        offsetCoord(chamber.coord, Dir.East),
        offsetCoord(chamber.coord, Dir.West),
        offsetCoord(chamber.coord, Dir.South),
      ])
    }
  }

  // target (center)
  const [targetChamber, setTargetChamber] = useState<MapChamber>({} as MapChamber)
  useEffect(() => {
    const _key = coordToSlug(currentChamberId)
    if (chambers[_key]) {
      setTargetChamber(chambers[_key])
    }
  }, [currentChamberId, chambers])

  return (
    <div className='FillParent'>
      {loaders.map((coord: bigint) => {
        return <MapLoader key={`loader_${coord.toString()}`} coord={coord} addChamber={_addChamber} />
      })}
      <div className='MapView'>
        <MapView targetChamber={targetChamber} chambers={Object.values(chambers)} tileSize={tileSize} />
      </div>

      <LevelSelector />

      {/* <div className='RowUI AlignBottom'>
        {[2, 3, 4, 5, 6].map((value: number) => {
          return <button key={`tileSize_${value}`} className={`SmallButton ${value == tileSize ? 'Unlocked' : 'Locked'}`} onClick={() => seTtileSize(value)}>{value}</button>
        })}
      </div> */}
    </div>
  )
}

interface MapLoaderProps {
  coord: bigint,
  addChamber: (chamber: MapChamber) => void,
}
function MapLoader({
  coord,
  addChamber,
}: MapLoaderProps) {
  const { gameTilemap } = useChamberMap(coord)
  useEffect(() => {
    if (gameTilemap) {
      const compass = coordToCompass(coord)
      addChamber({
        coord,
        compass,
        mapPos: compassToMapViewPos(compass),
        gameTilemap,
        exists: true,
      })
    }
  }, [coord, gameTilemap])
  return <></>
}

export default MapPanel
