import React, { ReactNode, createContext, useReducer, useContext } from 'react'
import { Dir, Position, TileType } from '@/underdark/utils/underdark'
import { MESSAGES } from '@/underdark/data/messages'
import { clamp } from 'three/src/math/MathUtils'


//--------------------------------------
// Must be in sync with constants.cairo
const LIGHT_MAX = 100;
const LIGHT_STEP_DROP = 10;
const SANITY_MAX = 100;
const MONSTER_NEAR_DAMAGE = 2;
const MONSTER_HIT_DAMAGE = 8;
//--------------------------------------


type Step = {
  tile: number
  dir: Dir
}

type Movement = {
  dir: Dir
  tilemap: TileType[]
}

export enum GameState {
  Lobby = 'lobby',
  Loaded = 'loaded',
  Playing = 'playing',
  Verifying = 'verifying',
  Verified = 'verified',
  NotVerified = 'not_verified',
  NoHealth = 'no_health',
  Slendered = 'slendered',
}

type ThreeJsGame = any;

//--------------------------------
// State
//
export const initialState = {
  gameImpl: null,
  gameState: GameState.Lobby,
  inLobby: false,
  hasInteracted: false,
  startPosition: null,
  playerPosition: null,
  light: 0,
  health: 0,
  message: null,
  steps: [],
}

type GameplayStateType = {
  gameImpl: ThreeJsGame
  gameState: GameState
  inLobby: boolean
  hasInteracted: boolean
  startPosition: Position
  playerPosition: Position
  light: number     // 0..100
  health: number    // 0..100
  message: string
  steps: Step[]
}

//--------------------------------
// Actions
//

const GameplayActions = {
  SET_GAME_IMPL: 'SET_GAME_IMPL',
  SET_LOBBY: 'SET_LOBBY',
  SET_INTERACTED: 'SET_INTERACTED',
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
  | { type: 'SET_INTERACTED', payload: boolean }
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
// React + Typescript + Context
// https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/context
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
      case GameplayActions.SET_LOBBY: {
        newState.inLobby = action.payload as boolean
        break
      }
      case GameplayActions.SET_INTERACTED: {
        newState.hasInteracted = action.payload as boolean
        break
      }
      case GameplayActions.RESET: {
        const position = action.payload as Position
        newState.gameState = GameState.Loaded
        if (position) {
          // just loaded
          newState.startPosition = position
          newState.playerPosition = position
        } else if (newState.startPosition) {
          // restart
          newState.playerPosition = { ...newState.startPosition }
        }
        newState.light = LIGHT_MAX
        newState.health = SANITY_MAX
        newState.steps = []
        newState.message = ''
        // console.log(`>>> GAME RESET!`)
        break
      }
      case GameplayActions.REFILL_LIGHT: {
        const amount = action.payload as number
        newState.light = clamp(newState.light + amount, 0, LIGHT_MAX)
        break
      }
      case GameplayActions.DAMAGE: {
        const damage = action.payload as number
        newState.health = clamp(newState.health - damage, 0, SANITY_MAX)
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
        if (state.steps.length < 64 && tile != currentTile && tile >= 0 && tile <= 255 && movement.tilemap[tile] != TileType.Void) {
          newState.light = clamp(state.light - LIGHT_STEP_DROP, 0, LIGHT_MAX)
          newState.playerPosition = {
            ...state.playerPosition,
            tile,
          }
          const stepIndex = -1 //state.steps.findIndex((v) => v.tile == tile)
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
          // console.log(`steps:`, newState.steps.length, newState.steps)
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

  const dispatchGameImpl = (gameImpl: ThreeJsGame) => {
    dispatch({ type: GameplayActions.SET_GAME_IMPL, payload: gameImpl })
  }

  const dispatchInteracted = () => {
    dispatch({ type: GameplayActions.SET_INTERACTED, payload: true })
  }

  const dispatchMessage = (msg: string | null) => {
    if (msg !== null) {
      dispatch({ type: GameplayActions.SET_MESSAGE, payload: msg })
    }
  }

  const dispatchGameState = (newState: GameState) => {
    dispatch({ type: GameplayActions.SET_STATE, payload: newState })
    if (newState == GameState.Playing) {
      dispatchMessage(MESSAGES.GAME_START)
    } else if (newState == GameState.NoHealth) {
      dispatchMessage(MESSAGES.NO_HEALTH)
    } else if (newState == GameState.Slendered) {
      dispatchMessage(MESSAGES.SLENDERED)
    } else if (newState == GameState.Verifying) {
      dispatchMessage(MESSAGES.FOUND_EXIT)
    } else if (newState == GameState.Verified) {
      dispatchMessage(MESSAGES.VERIFIED)
    } else if (newState == GameState.NotVerified) {
      dispatchMessage(MESSAGES.NOT_VERIFIED)
    }
  }

  const dispatchLobby = (value: boolean) => {
    dispatch({ type: GameplayActions.SET_LOBBY, payload: value })
    if (value) {
      dispatchGameState(GameState.Lobby)
      dispatchMessage('')
    }
  }

  const dispatchReset = (playerStart: Position | null, startGame: boolean) => {
    dispatch({ type: GameplayActions.RESET, payload: playerStart })
    if (startGame) {
      dispatchGameState(GameState.Playing)
    }
  }
  const dispatchMoveTo = (movement: Movement) => {
    dispatch({ type: GameplayActions.MOVE_TO, payload: movement })
    dispatchMessage('')
  }

  const dispatchTurnTo = (dir: Dir) => {
    dispatch({ type: GameplayActions.TURN_TO, payload: dir })
  }

  const dispatchDarkTar = (value: number = LIGHT_MAX) => {
    dispatch({ type: GameplayActions.REFILL_LIGHT, payload: value })
    dispatchMessage(MESSAGES.DARK_TAR)
  }

  const dispatchNearDamage = () => {
    dispatch({ type: GameplayActions.DAMAGE, payload: MONSTER_NEAR_DAMAGE })
    dispatchMessage(MESSAGES.MONSTER_DAMAGE)
  }

  const dispatchHitDamage = () => {
    dispatch({ type: GameplayActions.DAMAGE, payload: MONSTER_HIT_DAMAGE })
    dispatchMessage(MESSAGES.MONSTER_HIT)
  }

  const dispatchSlendered = () => {
    dispatchGameState(GameState.Slendered)
    dispatchMessage(MESSAGES.SLENDERED)
  }

  return {
    state,
    ...state,
    isLoaded: (state.gameState == GameState.Loaded),
    isPlaying: (state.gameState == GameState.Playing),
    isGameOver: [GameState.Verifying, GameState.Verified, GameState.NotVerified, GameState.NoHealth, GameState.Slendered].includes(state.gameState),
    hasLight: (state.light > 0),
    stepCount: state.steps.length, // 0..64
    // GameplayActions,
    // dispatch,
    dispatchGameImpl,
    dispatchInteracted,
    dispatchMessage,
    dispatchLobby,
    dispatchReset,
    dispatchGameState,
    dispatchMoveTo,
    dispatchTurnTo,
    dispatchDarkTar,
    dispatchNearDamage,
    dispatchHitDamage,
    dispatchSlendered,
  }
}

