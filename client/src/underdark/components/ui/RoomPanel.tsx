import React, { useEffect } from 'react'
import Link from 'next/link'
import { useChamber, useRoomChamberIds } from '@/underdark/hooks/useChamber'
import { useUnderdarkContext } from '@/underdark/hooks/UnderdarkContext'
import { bigintToHex } from '@/underdark/utils/utils'
import { MAX_GAMES } from '@/underdark/components/ui/RoomSelector'
import { coordToSlug } from '@/underdark/utils/underdark'

function RoomPanel() {
  const { roomId, chamberId, dispatch, UnderdarkActions } = useUnderdarkContext()
  const { chamberExists, yonder } = useChamber(chamberId)

  const { chamberIds } = useRoomChamberIds(roomId)
  useEffect(() => {
    const coord = chamberIds.length > 0 ? chamberIds[chamberIds.length - 1] : 0n
    dispatch({
      type: UnderdarkActions.SET_CHAMBER,
      payload: coord,
    })
  }, [chamberIds])

  const _randomizeGame = () => {
    const newRoomId = Math.floor(Math.random() * MAX_GAMES) + 1
    dispatch({
      type: UnderdarkActions.SET_ROOM,
      payload: newRoomId,
    })
  }

  return (
    <div className='RoomPanel Padded'>
      <h2>
        Room #{roomId.toString()}
        {' '}
        <span className='Anchor' onClick={() => _randomizeGame()}>🔄</span>
      </h2>

      {bigintToHex(chamberId)}
      {chamberId && <><br /><b>({coordToSlug(chamberId, yonder)})</b></>}

      <br />
      <Link href='/manor'>Manor</Link>

      {!chamberExists && <>
        <div>
          This Room has not been
          <br />
          explored yet!
        </div>
      </>}

      {chamberExists && <>

        {/* <br /> */}
        {/* Level: <b>{yonder}</b> */}

      </>}
    </div>
  )
}

export default RoomPanel
