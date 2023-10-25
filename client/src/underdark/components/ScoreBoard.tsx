import { useMemo } from 'react'
import { useLevelScores, useScoreByKey } from '../hooks/useChamber'
import { useUnderdarkContext } from '../hooks/UnderdarkContext'

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

  const scores = useMemo(() => {
    return scoreKeys.map((scoreKey) => {
      return <Score key={scoreKey.toString()} scoreKey={scoreKey} />
    })
  }, [scoreKeys])

  return (
    <div className=''>
      {/* <h2>Game #{gameId.toString()}</h2> */}
      <h2>Scores</h2>
      {scores}
    </div>
  )
}

export default ScoreBoard
