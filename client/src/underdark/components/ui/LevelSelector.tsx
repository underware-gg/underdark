import { useEffect, useMemo, useState } from 'react'
import { useUnderdarkContext } from '../../hooks/UnderdarkContext'
import { useChamber, useChamberMap, useChamberOffset, usePlayerScore } from '../../hooks/useChamber'
import { MapChamber, MapView, compassToMapViewPos } from './MapView'
import { Dir, coordToCompass, coordToSlug, offsetCoord } from '../../utils/underdark'
import { Col, Grid, Row } from '../Grid'
import { useDojoAccount, useDojoSystemCalls } from '../../../DojoContext'
import { levels } from '../../data/levels'

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


function LevelSelector() {
  const { gameId, chamberId } = useUnderdarkContext()
  const { yonder } = useChamber(chamberId)
  const { doors } = useChamberMap(chamberId)

  const [levelIndex, setLevelIndex] = useState(10)
  useEffect(() => {
    setLevelIndex(Number(chamberId % BigInt(levels.length)))
  }, [chamberId])

  return (
    <Grid className='RowUI'>
      <Row stretched>
        <Col width={4} className='UI'>
          <DirectionButton chamberId={chamberId} gameId={gameId} yonder={yonder} dir={Dir.West} doorTile={doors?.west ?? 0} levelIndex={levelIndex} />
        </Col>
        <Col width={8} className='Padded'>
          <h3>
            Game #{gameId}
            <br />
            Level {yonder}
          </h3>
        </Col>
        <Col width={4} className='UI'>
          <DirectionButton chamberId={chamberId} gameId={gameId} yonder={yonder} dir={Dir.East} doorTile={doors?.east ?? 0} levelIndex={levelIndex} />
        </Col>
      </Row>
    </Grid>
  )
}




//-------------------
// Buttons
//

interface DirectionButtonProps {
  chamberId: bigint
  gameId: number
  yonder: number
  dir: Dir
  doorTile: number
  levelIndex: number
}

function DirectionButton({
  chamberId,
  gameId,
  yonder,
  dir,
  // doorTile,
  levelIndex,
}: DirectionButtonProps) {
  const { dispatch, UnderdarkActions } = useUnderdarkContext()
  const { start_level } = useDojoSystemCalls()
  const { account } = useDojoAccount()

  const { locationId, seed } = useChamberOffset(chamberId, dir)
  const exists = useMemo(() => (seed > 0n), [seed, locationId])

  const { levelIsCompleted } = usePlayerScore(chamberId, account)

  const levelAsset = useMemo(() => (levels[levelIndex]), [levelIndex])
  // const levelAsset = useMemo(() => (levels[Math.floor(Math.random() * levels.length)]), [levelIndex])

  const _mint = () => {
    // start_level(account, gameId, yonder + 1, 0n, dir, levelAsset.name, levelAsset.value)
    start_level(account, gameId, yonder + 1, 0n, dir, levelAsset.generatorName, levelAsset.generatorValue)
  }
  const _open = () => {
    dispatch({
      type: UnderdarkActions.SET_CHAMBER,
      payload: locationId,
    })
  }

  const _label = dir == Dir.West ? '-' : '+'

  if (exists) {
    return <button className='DirectionButton Unlocked' onClick={() => _open()}>{_label}</button>
  }
  if (dir == Dir.West) {
    return <button className='DirectionButton Locked' disabled={true}></button>
  }
  return <button className={`DirectionButton ${levelIsCompleted ? 'Unlocked' : 'Locked'}`} disabled={!levelIsCompleted} onClick={() => _mint()}>{_label}</button>
}



export default LevelSelector
