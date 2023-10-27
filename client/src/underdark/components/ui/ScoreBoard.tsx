import { useMemo } from 'react'
import { useLevelScores, usePlayerScore, useScoreByKey } from '../../hooks/useChamber'
import { useUnderdarkContext } from '../../hooks/UnderdarkContext'
import { useDojoAccount } from '../../../DojoContext'

function Score({
  scoreKey,
}) {
  const score = useScoreByKey(scoreKey)
  if (score.moves == 0) return <></>
  return (
    <div className=''>
      <li>{score.moves}</li>
    </div>
  )
}

function ScoreBoard({
}) {
  const { chamberId } = useUnderdarkContext()
  const { scoreKeys } = useLevelScores(chamberId)
  const { account } = useDojoAccount()

  const scores = useMemo(() => {
    return scoreKeys.map((scoreKey) => {
      return <Score key={scoreKey.toString()} scoreKey={scoreKey} />
    })
  }, [scoreKeys])

  const score = usePlayerScore(chamberId, account);

  return (
    <div className=''>
      {/* <h2>Game #{gameId.toString()}</h2> */}
      <h2>Scores</h2>
      {scores.length > 0 ? scores : '-'}
      <h2>Your</h2>
      {score.moves > 0 ? score.moves : '-'}
    </div>
  )
}

export default ScoreBoard
