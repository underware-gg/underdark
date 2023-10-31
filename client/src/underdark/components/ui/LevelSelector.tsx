import { useEffect, useMemo, useState } from 'react'
import { useUnderdarkContext } from '../../hooks/UnderdarkContext'
import { useChamber, useChamberMap, useChamberOffset, usePlayerScore } from '../../hooks/useChamber'
import { Dir, coordToCompass } from '../../utils/underdark'
import { Col, Grid, Row } from '../Grid'
import { useDojoAccount, useDojoSystemCalls } from '../../../DojoContext'
import { levels } from '../../data/levels'
import { PrevNextButton } from './UIButtons'

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
          <NextLevelButton chamberId={chamberId} gameId={gameId} yonder={yonder} dir={Dir.West} levelIndex={levelIndex} />
        </Col>
        <Col width={8} className='Padded'>
          <h3>
            Level {Math.max(yonder, 1)}
          </h3>
        </Col>
        <Col width={4} className='UI'>
          <NextLevelButton chamberId={chamberId} gameId={gameId} yonder={yonder} dir={Dir.East} levelIndex={levelIndex} />
        </Col>
      </Row>
    </Grid>
  )
}




//-------------------
// Buttons
//

interface NextLevelButtonProps {
  chamberId: bigint
  gameId: number
  yonder: number
  dir: Dir
  levelIndex: number
}

function NextLevelButton({
  chamberId,
  gameId,
  yonder,
  dir,
  levelIndex,
}: NextLevelButtonProps) {
  const { dispatch, UnderdarkActions } = useUnderdarkContext()
  const { generate_level } = useDojoSystemCalls()
  const { account } = useDojoAccount()

  const { locationId, seed } = useChamberOffset(chamberId, dir)
  const exists = useMemo(() => (seed > 0n), [seed, locationId])

  const { levelIsCompleted } = usePlayerScore(chamberId, account)

  const levelAsset = useMemo(() => (levels[levelIndex]), [levelIndex])
  // const levelAsset = useMemo(() => (levels[Math.floor(Math.random() * levels.length)]), [levelIndex])

  const _mint = () => {
    // generate_level(account, gameId, yonder + 1, 0n, dir, levelAsset.name, levelAsset.value)
    generate_level(account, gameId, yonder + 1, 0n, dir, levelAsset.generatorName, levelAsset.generatorValue)
  }
  const _open = () => {
    dispatch({
      type: UnderdarkActions.SET_CHAMBER,
      payload: locationId,
    })
  }

  const direction = (dir == Dir.West ? -1 : 1)
  const isFirst = (direction < 0 && yonder <= 1)

  if (exists) {
    return <PrevNextButton direction={direction} onClick={() => _open()} />
  }
  return <PrevNextButton direction={direction} disabled={!levelIsCompleted || isFirst}  onClick={() => _mint()} />
}


export default LevelSelector
