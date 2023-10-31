import { useDojoAccount, useDojoSystemCalls } from '../../../DojoContext'
import { useGameplayContext } from '../../hooks/GameplayContext'
import { useUnderdarkContext } from '../../hooks/UnderdarkContext'
import { useChamber, useChamberMap } from '../../hooks/useChamber'
import { ActionButton } from './UIButtons'
import { Dir } from '../../utils/underdark'
import { levels } from '../../data/levels'
// import { Account } from 'starknet'


function InfoPanel() {
  const { message } = useGameplayContext()

  return (
    <div className='InfoPanel AlignCenter AlignMiddle'>

      <div className='Message'>
        <div className='CenteredContainer'>
          <StartButton />
        </div>
        {/* {isPlaying && <p>steps: <b>{stepCount}</b></p>} */}
      </div>

      <div className='Message'>
        <div className='CenteredContainer'>
          <h2>{message}</h2>
        </div>
      </div>

    </div>
  )
}


const StartButton = () => {
  const { chamberId } = useUnderdarkContext()
  const { chamberExists } = useChamber(chamberId)
  const { gameTilemap } = useChamberMap(chamberId)
  const { isLoaded, dispatchReset } = useGameplayContext()

  const _startGame = () => {
    dispatchReset(gameTilemap.playerStart, true)
  }

  if (!chamberExists) {
    return <GenerateGameButton />
  }

  const _label = isLoaded ? 'START' : 'RESTART'

  return <ActionButton onClick={() => _startGame()} label={_label} />
}


function GenerateGameButton() {
  const { generate_level } = useDojoSystemCalls()
  const { account } = useDojoAccount()

  const { gameId, chamberId } = useUnderdarkContext()
  const { chamberExists } = useChamber(chamberId)

  const canGenerateFirstLevel = (gameId > 0 && !chamberExists)

  const _generateFirstGameLevel = () => {
    if (canGenerateFirstLevel) {
      // const coord = makeEntryChamberId()
      const _level = levels[Math.floor(Math.random() * levels.length)]
      // console.log(_level)
      // generate_level(account, gameId, 1, 0n, Dir.Under, 'entry', 0)
      generate_level(account, gameId, 1, 0n, Dir.Under, _level.generatorName, _level.generatorValue)
    }
  }

  return <ActionButton disabled={!canGenerateFirstLevel} onClick={() => _generateFirstGameLevel()} label='GENERATE GAME' />
}



export default InfoPanel
