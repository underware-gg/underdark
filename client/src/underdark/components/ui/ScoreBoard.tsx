import { useMemo } from 'react'
import { useLevelScores, usePlayerScore, useScoreByKey } from '@/underdark/hooks/useChamber'
import { useUnderdarkContext } from '@/underdark/hooks/UnderdarkContext'
import { useDojoAccount } from '@/dojo/DojoContext'

function Score({
  scoreKey,
}) {
  const score = useScoreByKey(scoreKey)
  if (score.score == 0) return <></>
  return (
    <div className=''>
      <li>{score.score} points, {score.moves} moves</li>
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

  const { scoreKey, moves } = usePlayerScore(chamberId, account)

  if (scores.length == 0) {
    return (
      <div>
        <b>No scores yet</b>
      </div>
    )
  }

  return (
    <div className=''>
      {/* <h2>Game #{roomId.toString()}</h2> */}
      <b>Scores</b>
      {scores.length > 0 ? scores : <li>'-'</li>}
      <b>You</b>
      {moves > 0 ? <Score scoreKey={scoreKey} /> : <li>'-'</li>}
    </div>
  )
}

export default ScoreBoard
