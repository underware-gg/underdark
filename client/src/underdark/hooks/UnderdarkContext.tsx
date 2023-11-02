import React, { ReactNode, createContext, useReducer, useContext } from 'react'

//
// React + Typescript + Context
// https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/context
//

//--------------------------------
// Constants
//
export const initialState = {
  realmId: 5962,                        // Sissisnorsis
  manorCoord: BigInt('0x39400000385'),  // Kurnkunor, S901,E916
  roomId: 1,
  chamberId: 0n,
  // constants
  logo: '/pubic/logo.png',
}

const UnderdarkActions = {
  SET_GAME: 'SET_GAME',
  SET_CHAMBER: 'SET_CHAMBER',
}

//--------------------------------
// Types
//
type UnderdarkStateType = {
  realmId: number
  manorCoord: bigint
  roomId: number
  chamberId: bigint
  // constants
  logo: string
}

type ActionType =
  | { type: 'SET_GAME', payload: number }
  | { type: 'SET_CHAMBER', payload: bigint }



//--------------------------------
// Context
//
const UnderdarkContext = createContext<{
  state: UnderdarkStateType
  dispatch: React.Dispatch<any>
}>({
  state: initialState,
  dispatch: () => null,
})

//--------------------------------
// Provider
//
interface UnderdarkProviderProps {
  children: string | JSX.Element | JSX.Element[] | ReactNode
}
const UnderdarkProvider = ({
  children,
}: UnderdarkProviderProps) => {
  const [state, dispatch] = useReducer((state: UnderdarkStateType, action: ActionType) => {
    let newState = { ...state }
    switch (action.type) {
      case UnderdarkActions.SET_GAME: {
        newState.roomId = action.payload as number
        newState.chamberId = 0n
        break
      }
      case UnderdarkActions.SET_CHAMBER: {
        newState.chamberId = action.payload as bigint
        break
      }
      default:
        console.warn(`UnderdarkProvider: Unknown action [${action.type}]`)
        return state
    }
    return newState
  }, initialState)

  return (
    <UnderdarkContext.Provider value={{ state, dispatch }}>
      {children}
    </UnderdarkContext.Provider>
  )
}

export { UnderdarkProvider, UnderdarkContext, UnderdarkActions }


//--------------------------------
// Hooks
//

export const useUnderdarkContext = () => {
  const { state, dispatch } = useContext(UnderdarkContext)
  return {
    ...state,
    dispatch,
    UnderdarkActions,
  }
}

