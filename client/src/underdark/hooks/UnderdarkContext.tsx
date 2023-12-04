import React, { ReactNode, createContext, useReducer, useContext } from 'react'
import { makeRoomChamberId } from '../utils/underdark'

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
  SET_ROOM: 'SET_ROOM',
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
  | { type: 'SET_ROOM', payload: number }
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
      case UnderdarkActions.SET_ROOM: {
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
  const dispatchSetRoom = (roomId, levelNumber = null) => {
    dispatch({
      type: UnderdarkActions.SET_ROOM,
      payload: roomId,
    })
    dispatch({
      type: UnderdarkActions.SET_CHAMBER,
      payload: makeRoomChamberId(roomId, levelNumber ?? 1),
    })
  }
  const dispatchSetChamber = (chamberId) => {
    dispatch({
      type: UnderdarkActions.SET_CHAMBER,
      payload: chamberId,
    })
  }
  return {
    ...state,
    dispatch,
    UnderdarkActions,
    dispatchSetRoom,
    dispatchSetChamber,
  }
}

