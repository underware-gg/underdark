import React, { useMemo } from 'react'
import { useRouter } from 'next/router'
import { Segment, Grid, Container } from 'semantic-ui-react'
import { useAllRoomIds, useChamber, useRoomChamberIds, usePlayerScore } from '@/underdark/hooks/useChamber'
import { useUnderdarkContext } from '@/underdark/hooks/UnderdarkContext'
import { useDojoAccount } from '@/dojo/DojoContext'
import { Dir, coordToCompass, makeRoomChamberId, makeRoomName, offsetCoord } from '@/underdark/utils/underdark'
import { bigintToHex } from '@/underdark/utils/utils'
import { ActionButton } from '@/underdark/components/ui/UIButtons'
import { GenerateRoomButton } from '@/underdark/components/ui/Buttons'
import ScoreBoard from '@/underdark/components/ui/ScoreBoard'
import { MAX_GAMES } from './ui/RoomSelector'

const Row = Grid.Row
const Col = Grid.Column

function ManorRoomSelector() {
  return (
    <Container text>
      <Segment inverted>
        <Grid>
          <Rooms />
        </Grid>
      </Segment>
    </Container>
  )
}


function Rooms() {
  const { roomId: selectedRoomId } = useUnderdarkContext()
  const { roomIds } = useAllRoomIds()

  const listedRoomIds = useMemo(() => {
    let result = []
    const ids = roomIds.length > 0 ? roomIds : [1]
    for (let i = 0; i < ids.length; ++i) {
      const id = ids[i]
      result.push(id)
      const isLast = (i == ids.length - 1)
      if (isLast || ids[i + 1] != id + 1) {
        result.push(id + 1)
        result.push(null)
      }
    }
    // insert next and spaces
    return result
  }, [roomIds])

  const rows = useMemo(() => {
    let result = []
    listedRoomIds.forEach((roomId, index) => {
      if (!roomId) {
        result.push(<Row key={`sep_${index}`}><Col width={2} textAlign='center'><h3>...</h3></Col></Row>)
      } else {
        result.push(
          <RoomRow key={`row_${roomId}`}
            roomId={roomId}
            isSelected={roomId == selectedRoomId}
          />
        )
      }
    })
    // random
    const newRoomId = Math.floor(Math.random() * MAX_GAMES) + 1
    result.push(
      <RoomRow key={`row_random`}
        roomId={-1}
        isSelected={false}
        label='Random Room'
      />
    )
    return result
  }, [listedRoomIds, selectedRoomId])

  return rows
}


function RoomRow({
  roomId,
  isSelected,
  label=null,
}) {
  const { dispatchSetRoom, chamberId: selectedChamberId } = useUnderdarkContext()

  const _setSelectedRoom = () => {
    if (!isSelected) {
      dispatchSetRoom(roomId)
    }
  }

  const _label = label ?? `Room #${roomId.toString()}`

  return (
    <Row>
      <Col width={4}>
        <ActionButton onClick={() => _setSelectedRoom()} label={_label} dimmed={!isSelected} />
      </Col>
      <Col width={4}>
        {isSelected &&
          <RoomLevels roomId={roomId} />
        }
      </Col>
      <Col width={8}>
        {isSelected &&
          <ChamberInfo roomId={roomId} chamberId={selectedChamberId} />
        }
      </Col>
    </Row>
  )
}

function RoomLevels({
  roomId
}) {
  const { chamberId: selectedChamberId } = useUnderdarkContext()
  const { chamberIds } = useRoomChamberIds(roomId)

  const rows = useMemo(() => {
    let result = [];
    [...chamberIds, makeRoomChamberId(roomId, chamberIds.length + 1)].sort((a, b) => Number(a - b)).forEach(chamberId => {
      result.push(
        <RoomLevel key={`row_${chamberId}`}
          roomId={roomId}
          chamberId={chamberId}
          isSelected={chamberId == selectedChamberId}
        />
      )
    })
    return result
  }, [chamberIds, selectedChamberId])

  return (
    <div>
      {rows}
    </div>
  )
}

function RoomLevel({
  roomId,
  chamberId,
  isSelected,
}) {
  const { account } = useDojoAccount()
  const { levelIsCompleted: previousLevelIsCompleted } = usePlayerScore(offsetCoord(chamberId, Dir.Over), account)

  const { dispatchSetChamber } = useUnderdarkContext()
  const _selectRoom = (chamberId) => {
    dispatchSetChamber(chamberId)
  }

  const compass = useMemo(() => coordToCompass(chamberId), [chamberId])

  if (!previousLevelIsCompleted && compass.under > 1) {
    return <></>
  }

  return (
    <ActionButton key={`row_${chamberId}`}
      onClick={() => _selectRoom(chamberId)}
      label={makeRoomName(roomId, compass.under)}
      dimmed={!isSelected}
    />
  )
}


function ChamberInfo({
  roomId,
  chamberId,
}) {
  const router = useRouter()
  const { chamberExists } = useChamber(chamberId)
  const compass = useMemo(() => coordToCompass(chamberId), [chamberId])

  const _enterRoom = () => {
    let url = `/room/${roomId}`
    if (compass.under > 1) {
      url += `/${compass.under}`
    }
    router.push(url)
  }

  if (!compass) {
    return <></>
  }

  return (
    <div>
      {bigintToHex(chamberId)}

      <hr />
      <ScoreBoard />
      <hr />

      {chamberExists
        ? <ActionButton onClick={() => _enterRoom()} label={'ENTER ROOM'} disabled={chamberId == 0n} />
        : <GenerateRoomButton roomId={roomId} levelNumber={compass.under} label='GENERATE ROOM' />
      }
    </div>
  )
}


export default ManorRoomSelector
