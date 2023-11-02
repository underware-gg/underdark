import { useDojoAccount, useDojoSystemCalls } from '../../../DojoContext'
import { GameState, useGameplayContext } from '../../hooks/GameplayContext'
import { useUnderdarkContext } from '../../hooks/UnderdarkContext'
import { useChamber, useChamberMap, useChamberOffset, usePlayerScore } from '../../hooks/useChamber'
import { ActionButton } from './UIButtons'
import { Dir } from '../../utils/underdark'
import { getLevelParams } from '../../data/levels'
// import { Account } from 'starknet'


function InfoPanel() {
  const { message } = useGameplayContext()

  return (
    <div className='InfoPanel AlignCenter AlignMiddle'>

      <div className='InfoTop'>
        <StartButton />
      </div>
      <div className='InfoTop'>
        <GenerateButton />
      </div>
      {/* {isPlaying && <p>steps: <b>{stepCount}</b></p>} */}

      <div className='CenteredContainer '>
        <div className='CenteredContent InfoBottom'>
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

  if (chamberExists) {
    const _label = isLoaded ? 'START' : 'RESTART'
    return (
      <ActionButton onClick={() => _startGame()} label={_label} />
    )
  }

  return <></>
}


function GenerateButton() {
  const { generate_level } = useDojoSystemCalls()
  const { account } = useDojoAccount()

  // generate first chamber
  const { roomId, chamberId } = useUnderdarkContext()
  const { yonder } = useChamber(chamberId)
  const canMintFirst = (yonder == 0)

  // for new next chambers
  const { levelIsCompleted } = usePlayerScore(chamberId, account)
  const { chamberExists: nextChamberExists } = useChamberOffset(chamberId, Dir.East)
  const canMintNext = (yonder > 0 && levelIsCompleted && !nextChamberExists)

  const { isPlaying } = useGameplayContext()

  const _generate = async () => {
    const _level = getLevelParams(yonder + 1)
    const success = await generate_level(account, roomId, yonder + 1, 0n, Dir.Under, _level.generatorName, _level.generatorValue)
    if (success) {
      console.log(`GENERATED... TODO: START GAME`)
    }
  }

  if ((canMintFirst || canMintNext) && !isPlaying) {
    const _label = (canMintFirst ? 'GENERATE ROOM' : 'GENERATE NEXT LEVEL')
    return (
      <ActionButton onClick={() => _generate()} label={_label} />
    )
  }

  return <></>
}


export default InfoPanel
