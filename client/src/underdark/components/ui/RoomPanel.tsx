import React, { useEffect } from 'react'
import { useChamber } from '@/underdark/hooks/useChamber'
import { useUnderdarkContext } from '@/underdark/hooks/UnderdarkContext'
import { bigintToHex } from '@/underdark/utils/utils'
import { coordToSlug, makeRoomName } from '@/underdark/utils/underdark'
import { GenerateButton } from '@/underdark/components/ui/Buttons'

function RoomPanel() {
  const { roomId, chamberId } = useUnderdarkContext()
  const { chamberExists, yonder } = useChamber(chamberId)

  return (
    <div className='RoomPanel Padded'>
      <h2>
        {makeRoomName(roomId, yonder)}
      </h2>

      {bigintToHex(chamberId)}
      <br />
      {chamberId && <b>({coordToSlug(chamberId, yonder)})</b>}

      {!chamberExists && <>
        <h4>
          This Room has not been
          <br />
          explored yet!
        </h4>
      </>}

      <GenerateButton />

      {chamberExists && <>
        {/* <br /> */}
        {/* Level: <b>{yonder}</b> */}
      </>}

    </div>
  )
}

export default RoomPanel
