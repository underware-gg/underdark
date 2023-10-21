import React, { ReactNode, createContext, useReducer, useContext, useEffect } from 'react'
import { Dir, Position, TileType } from '../utils/underdark'

//
// React + Typescript + Context
// https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/context
//

//--------------------------------
// State Types
//
export const initialState = {
  playerPosition: null,
  steps: [],
}

type Step = {
  tile: number,
  dir: Dir,
}

type Movement = {
  dir: Dir,
  tilemap: TileType[],
}

type GameplayStateType = {
  playerPosition: Position,
  steps: Step[],
}

//--------------------------------
// Actions
//

const GameplayActions = {
  RESET: 'RESET',
  MOVE_TO: 'MOVE_TO',
  TURN_TO: 'TURN_TO',
}

type ActionType =
  | { type: 'RESET', payload: Position }
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
      case GameplayActions.RESET: {
        const position = action.payload as Position
        newState.playerPosition = position
        newState.steps = []
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
        if (tile != currentTile && tile >= 0 && tile <= 255 && movement.tilemap[tile] != TileType.Void) {
          newState.playerPosition = {
            ...state.playerPosition,
            tile,
          }
          const step = {
            tile,
            dir: movement.dir,
          }
          newState.steps = [...state.steps, step]
          // console.log(`moved:`, step)
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

