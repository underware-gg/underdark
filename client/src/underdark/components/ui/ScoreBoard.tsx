import { useMemo } from 'react'
import { useLevelScores, usePlayerScore, useScoreByKey } from '../../hooks/useChamber'
import { useUnderdarkContext } from '../../hooks/UnderdarkContext'
import { useDojoAccount } from '@/dojo/DojoContext'

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

  const { scoreKey, moves } = usePlayerScore(chamberId, account);

  return (
    <div className=''>
      {/* <h2>Game #{roomId.toString()}</h2> */}
      <hr />
      <b>Scores</b>
      {scores.length > 0 ? scores : <li>'-'</li>}
      <b>You</b>
      {moves > 0 ? <Score scoreKey={scoreKey} /> : <li>'-'</li>}
    </div>
  )
}

export default ScoreBoard
