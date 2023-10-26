import React, { ReactNode, createContext, useReducer, useContext } from 'react'
import { Dir, Position, TileType } from '../utils/underdark'
// import { ThreeJsGame } from '../components/GameCanvas'

//
// React + Typescript + Context
// https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/context
//

type Step = {
  tile: number
  dir: Dir
}

type Movement = {
  dir: Dir
  tilemap: TileType[]
}

export enum GameState {
  Stoped = 0,
  Playing = 1,
  Verifying = 10,
  Won = 11,
  NoHealth = 20,
  Slendered = 21,
}
const _lightDrop = 10;

type ThreeJsGame = any;

//--------------------------------
// State
//
export const initialState = {
  gameImpl: null,
  gameState: GameState.Stoped,
  playerPosition: null,
  light: 0,
  health: 0,
  stepCount: 0,
  message: null,
  steps: [],
}

type GameplayStateType = {
  gameImpl: ThreeJsGame,
  gameState: GameState
  playerPosition: Position
  light: number     // 0..100
  health: number    // 0..100
  stepCount: number // 0..64
  message: string
  steps: Step[]
}

//--------------------------------
// Actions
//

const GameplayActions = {
  SET_GAME_IMPL: 'SET_GAME_IMPL',
  RESET: 'RESET',
  SET_STATE: 'SET_STATE',
  SET_MESSAGE: 'SET_MESSAGE',
  REFILL_LIGHT: 'REFILL_LIGHT',
  DAMAGE: 'DAMAGE',
  MOVE_TO: 'MOVE_TO',
  TURN_TO: 'TURN_TO',
}

type ActionType =
  | { type: 'SET_GAME_IMPL', payload: ThreeJsGame }
  | { type: 'RESET', payload: Position }
  | { type: 'SET_STATE', payload: GameState }
  | { type: 'SET_MESSAGE', payload: string }
  | { type: 'REFILL_LIGHT', payload: number }
  | { type: 'DAMAGE', payload: number }
  | { type: 'MOVE_TO', payload: Movement }
  | { type: 'TURN_TO', payload: Dir }



//--------------------------------
// Context
//
const GameplayContext = createContext<{
  state: GameplayStateType
  dispatch: React.Dispatch<any>
}>({
  state: initialState,
  dispatch: () => null,
})

//--------------------------------
// Provider
//
interface GameplayProviderProps {
  children: string | JSX.Element | JSX.Element[] | ReactNode
}
const GameplayProvider = ({
  children,
}: GameplayProviderProps) => {
  const [state, dispatch] = useReducer((state: GameplayStateType, action: ActionType) => {
    let newState = { ...state }
    switch (action.type) {
      case GameplayActions.SET_GAME_IMPL: {
        newState.gameImpl = action.payload as ThreeJsGame
        break
      }
      case GameplayActions.RESET: {
        const position = action.payload as Position
        newState.gameState = GameState.Playing
        newState.playerPosition = position
        newState.light = 100
        newState.health = 100
        newState.stepCount = 0
        newState.steps = []
        console.log(`>>> GAME START!`)
        break
      }
      case GameplayActions.REFILL_LIGHT: {
        newState.light = 100
        newState.message = 'Dark Tar refills your light!'
        break
      }
      case GameplayActions.DAMAGE: {
        newState.health = Math.max(0, newState.health - 5)
        newState.message = 'Monster damage!!!!'
        break
      }
      case GameplayActions.SET_STATE: {
        newState.gameState = action.payload as GameState
        console.log(`>>> GAME STATE:`, newState.gameState)
        break
      }
      case GameplayActions.SET_MESSAGE: {
        newState.message = action.payload as string
        break
      }
      case GameplayActions.MOVE_TO: {
        const movement = action.payload as Movement
        const currentTile = state.playerPosition.tile;
        const x = currentTile % 16
        const y = Math.floor(currentTile / 16)
        const dx = (movement.dir == Dir.West && x > 0) ? -1 : (movement.dir == Dir.East && x < 15) ? 1 : 0
        const dy = (movement.dir == Dir.North && y > 0) ? -1 : (movement.dir == Dir.South && y < 15) ? 1 : 0
        const tile = currentTile + dx + (16 * dy)
        if (state.stepCount < 64 && tile != currentTile && tile >= 0 && tile <= 255 && movement.tilemap[tile] != TileType.Void) {
          newState.light = Math.max(0, state.light - _lightDrop)
          newState.playerPosition = {
            ...state.playerPosition,
            tile,
          }
          const stepIndex = state.steps.findIndex((v) => v.tile == tile)
          if (stepIndex != -1) {
            // step back
            newState.steps = [...state.steps.slice(0, stepIndex + 1)]
          } else {
            // new step
            const step = {
              tile,
              dir: movement.dir,
            }
            newState.steps = [...state.steps, step]
          }
          newState.stepCount = newState.steps.length
          // console.log(`steps:`, newState.stepCount, newState.steps)
        }
        break
      }
      case GameplayActions.TURN_TO: {
        const facing = action.payload as Dir
        newState.playerPosition = {
          ...state.playerPosition,
          facing,
        }
        break
      }
      default:
        console.warn(`GameplayProvider: Unknown action [${action.type}]`)
        return state
    }
    return newState
  }, initialState)

  return (
    <GameplayContext.Provider value={{ state, dispatch }}>
      {children}
    </GameplayContext.Provider>
  )
}

export { GameplayProvider, GameplayContext, GameplayActions }


//--------------------------------
// Hooks
//

export const useGameplayContext = () => {
  const { state, dispatch } = useContext(GameplayContext)
  return {
    ...state,
    dispatch,
    GameplayActions,
  }
}

