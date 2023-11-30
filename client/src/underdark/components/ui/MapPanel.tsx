import React, { useEffect, useState } from 'react'
import { useUnderdarkContext } from '../../hooks/UnderdarkContext'
import { useChamber, useChamberMap } from '../../hooks/useChamber'
import { MapChamber, MapView, compassToMapViewPos } from './MapView'
import { Dir, coordToCompass, coordToSlug, offsetCoord } from '../../utils/underdark'


//-----------------------------
// Entry Point
//
function MapPanel() {
  const [tileSize, seTtileSize] = useState(10)
  const { roomId, chamberId: currentChamberId } = useUnderdarkContext()
  const { yonder } = useChamber(currentChamberId)

  useEffect(() => {
    setLoaders([])
    setChambers({})
  }, [roomId])

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
    if (newLoaders.length > 0) {
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
    <div className='MapView'>
      {loaders.map((coord: bigint) => {
        return <MapPreLoader key={`loader_${coord.toString()}`} coord={coord} addChamber={_addChamber} />
      })}

      <MapView targetChamber={targetChamber} chambers={Object.values(chambers)} tileSize={tileSize} />

      {/* <div className='RowUI AlignBottom'>
        {[2, 3, 4, 5, 6].map((value: number) => {
          return <button key={`tileSize_${value}`} className={`SmallButton ${value == tileSize ? 'Unlocked' : 'Locked'}`} onClick={() => seTtileSize(value)}>{value}</button>
        })}
      </div> */}
    </div>
  )
}

function MapPreLoader({
  coord,
  addChamber,
}) {
  const { chamberExists } = useChamber(coord)
  if(chamberExists) {
    return <MapLoader coord={coord} addChamber={addChamber} />
  }
  return <></>
}

function MapLoader({
  coord,
  addChamber,
}) {
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
