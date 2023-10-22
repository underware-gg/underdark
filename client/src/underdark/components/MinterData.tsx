import { useEffect, useMemo, useState } from 'react'
import { useDojoSystemCalls, useDojoAccount } from '../../DojoContext'
import { useChamber, useChamberMap, useChamberOffset, useGameChamberIds } from '../hooks/useChamber'
import { useUnderdarkContext } from '../hooks/UnderdarkContext'
import { Dir, DirNames, coordToSlug } from '../utils/underdark'

interface Generator {
  name: string
  value: number
  description: string
}

const _generators: Generator[] = [
  // debug
  { name: 'seed', value: 0, description: '' },
  { name: 'underseed', value: 0, description: '' },
  { name: 'overseed', value: 0, description: '' },
  { name: 'protected', value: 0, description: '' },
  // default entry
  { name: 'entry', value: 0, description: '' },
  // connections
  { name: 'connection', value: 0, description: 'narrow connection' },
  { name: 'connection', value: 1, description: 'wide connection' },
  { name: 'connection', value: 2, description: 'carved connection' },
  { name: 'connection', value: 2, description: 'wider carved connection' },
  // binary tree mazes
  { name: 'binary_tree_classic', value: 0, description: '' },
  { name: 'binary_tree_pro', value: 0, description: '' },
  { name: 'binary_tree_fuzz', value: 0, description: '' },
  // collapse
  { name: 'collapse', value: 0, description: 'collapse tight' },
  { name: 'collapse', value: 1, description: 'collapse wide' },
  // carver / automata
  { name: 'carve', value: 2, description: '' },
  { name: 'carve', value: 3, description: '' },
  { name: 'carve', value: 36, description: '' },
  { name: 'carve', value: 37, description: 'entry' },
  { name: 'carve', value: 4, description: '' },
  { name: 'carve', value: 44, description: '' },
  { name: 'carve', value: 45, description: '' },
  { name: 'carve', value: 46, description: '' },
  { name: 'carve', value: 47, description: '' },
  { name: 'carve', value: 5, description: '' },
  { name: 'carve', value: 44, description: '' },
  { name: 'carve', value: 45, description: '' },
  { name: 'carve', value: 46, description: '' },
  { name: 'carve', value: 47, description: '' },
  { name: 'carve', value: 54, description: '' },
  { name: 'carve', value: 55, description: 'OK' },
  { name: 'carve', value: 56, description: '' },
  { name: 'carve', value: 57, description: '' },
  { name: 'carve', value: 6, description: '' },
  { name: 'carve', value: 63, description: '' },
  { name: 'carve', value: 64, description: '' },
  { name: 'carve', value: 65, description: '' },
  { name: 'carve', value: 7, description: '' },
  { name: 'carve', value: 8, description: '' },
  { name: 'carve', value: 9, description: '' },
  // collapse
  { name: 'collapse_carve', value: 3, description: '' },
  { name: 'collapse_carve', value: 4, description: 'OK' },
  { name: 'collapse_carve', value: 5, description: 'OK' },
  { name: 'collapse_carve', value: 6, description: '' },
]


interface DirectionButtonProps {
  chamberId: bigint
  gameId: number
  yonder: number
  dir: Dir
  doorTile: number
  generator: Generator
}

function DirectionButton({
  chamberId,
  gameId,
  yonder,
  dir,
  // doorTile,
  generator,
}: DirectionButtonProps) {
  const { dispatch, UnderdarkActions } = useUnderdarkContext()
  const { start_level } = useDojoSystemCalls()
  const { account } = useDojoAccount()

  const { locationId, seed } = useChamberOffset(chamberId, dir)
  const exists = useMemo(() => (seed > 0n), [seed, locationId])

  const _mint = () => {
    start_level(account, gameId, yonder+1, 0n, dir, generator.name, generator.value)
  }
  const _open = () => {
    dispatch({
      type: UnderdarkActions.SET_CHAMBER,
      payload: locationId,
    })
  }

  if (exists) {
    return <button className='DirectionButton Unlocked' onClick={() => _open()}>Go<br />{DirNames[dir]}</button>
  }
  return <button className='DirectionButton Locked' disabled={dir == Dir.West} onClick={() => _mint()}>Unlock<br />{DirNames[dir]}</button>
}



function MinterData() {
  const { start_level } = useDojoSystemCalls()
  const { account } = useDojoAccount()

  const [generatorIndex, setGeneratorIndex] = useState(10)

  // Current Realm / Chamber
  const { gameId, chamberId, dispatch, UnderdarkActions } = useUnderdarkContext()
  const { seed, yonder } = useChamber(chamberId)
  const { doors } = useChamberMap(chamberId)

  const chamberExists = useMemo(() => (seed > 0), [seed])
  const canMintFirst = useMemo(() => (gameId > 0 && !chamberExists), [gameId, chamberExists])

  const { chamberIds } = useGameChamberIds(gameId)
  useEffect(() => {
    _selectChamber(chamberIds.length > 0 ? chamberIds[chamberIds.length - 1] : 0n)
  }, [chamberIds])

  const _setSelectedGame = (newGameId: number) => {
    if (newGameId > 0) {
      dispatch({
        type: UnderdarkActions.SET_GAME,
        payload: newGameId,
      })
    }
  }

  const _selectChamber = (coord: bigint) => {
    dispatch({
      type: UnderdarkActions.SET_CHAMBER,
      payload: coord,
    })
  }

  const _mintFirst = () => {
    if (canMintFirst && gameId) {
      // const coord = makeEntryChamberId()
      start_level(account, gameId, 1, 0n, Dir.Under, 'entry', 0)
    }
  }

  // useEffect(() => {
  //   const compass = coordToCompass(chamberId)
  //   console.log(`CHAMBER:`, compass)
  //   console.log(`+ NORTH:`, offsetCompass(compass, Dir.North))
  //   console.log(`+ EAST:`, offsetCompass(compass, Dir.East))
  //   console.log(`+ WEST:`, offsetCompass(compass, Dir.West))
  //   console.log(`+ SOUTH:`, offsetCompass(compass, Dir.South))
  // }, [chamberId])

  return (
    <div className='MinterData AlignTop'>
      <p>
        Game #{gameId.toString()}
        {' '}
        <span className='Anchor' onClick={() => _setSelectedGame(gameId - 1)}>⏪️</span>
        <span className='Anchor' onClick={() => _setSelectedGame(gameId + 1)}>⏩️</span>
        {' '}
        <span className='Anchor' onClick={() => _setSelectedGame(Math.floor(Math.random() * 10000) + 1)}>🔄</span>
      </p>

      {!chamberExists && <>
        <div>
          <button disabled={!canMintFirst} onClick={() => _mintFirst()}>Start New Game</button>
        </div>
        <br />
      </>}

      {chamberExists && <>
        <p><b>{coordToSlug(chamberId, yonder)}</b></p>
        
        <p>Level: <b>{yonder}</b></p>

        {/* <p>Doors: [{doors.north},{doors.east},{doors.west},{doors.south}]</p> */}
        
        {/* <p>State: [{state.light},{state.threat},{state.wealth}]</p> */}

        <div className='Padded'>
          <DirectionButton chamberId={chamberId} gameId={gameId} yonder={yonder} dir={Dir.West} doorTile={doors?.west ?? 0} generator={_generators[generatorIndex]} />
          <DirectionButton chamberId={chamberId} gameId={gameId} yonder={yonder} dir={Dir.East} doorTile={doors?.east ?? 0} generator={_generators[generatorIndex]} />
        </div>

        <div>
          <select value={generatorIndex} onChange={e => setGeneratorIndex(parseInt(e.target.value))}>
            {_generators.map((g: Generator, index: number) => {
              const _desc = `${g.name}(${g.value}) : ${g.description}`
              return <option value={index} key={`gen_${index}`}>{_desc}</option>
            })}
          </select>
        </div>
      </>}

    </div>
  )
}

export default MinterData
