import React, { useMemo } from 'react'
import { useRouter } from 'next/router'
import { Segment, Grid, Container, Divider } from 'semantic-ui-react'
import { useAllRoomIds, useChamber, useRoomChamberIds, usePlayerScore } from '@/underdark/hooks/useChamber'
import { useUnderdarkContext } from '@/underdark/hooks/UnderdarkContext'
import { useDojoAccount } from '@/dojo/DojoContext'
import { Dir, coordToCompass, makeRoomChamberId, offsetCoord } from '@/underdark/utils/underdark'
import { bigintToHex } from '@/underdark/utils/utils'
import { ActionButton } from '@/underdark/components/ui/UIButtons'
import { GenerateRoomButton } from '@/underdark/components/Buttons'
import ScoreBoard from '@/underdark/components/ui/ScoreBoard'

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
    let lastId = null
    for (let i = 0; i < roomIds.length; ++i) {
      const id = roomIds[i]
      if (lastId && id != lastId + 1) {
        result.push(lastId + 1)
        result.push(null)
      }
      result.push(id)
      lastId = id
    }
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
    return result
  }, [listedRoomIds, selectedRoomId])

  return rows
}


function RoomRow({
  roomId,
  isSelected,
}) {
  const { dispatch, UnderdarkActions, chamberId: selectedChamberId } = useUnderdarkContext()

  const _setSelectedRoom = () => {
    if (!isSelected) {
      dispatch({
        type: UnderdarkActions.SET_ROOM,
        payload: roomId,
      })
      dispatch({
        type: UnderdarkActions.SET_CHAMBER,
        payload: makeRoomChamberId(roomId, 1),
      })
    }
  }

  const label = `Room #${roomId.toString()}`

  return (
    <Row>
      <Col width={4}>
        <ActionButton onClick={() => _setSelectedRoom()} label={label} dimmed={!isSelected} />
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
  chamberId,
  isSelected,
}) {
  const { account } = useDojoAccount()
  const { levelIsCompleted: previousLevelIsCompleted } = usePlayerScore(offsetCoord(chamberId, Dir.Over), account)

  const { dispatch, UnderdarkActions } = useUnderdarkContext()
  const _selectRoom = (chamberId) => {
    dispatch({
      type: UnderdarkActions.SET_CHAMBER,
      payload: chamberId,
    })
  }

  const compass = useMemo(() => coordToCompass(chamberId), [chamberId])

  if (!previousLevelIsCompleted && compass.under > 1) {
    return <></>
  }

  return (
    <ActionButton key={`row_${chamberId}`}
      onClick={() => _selectRoom(chamberId)}
      label={`Level ${compass.under.toString()}`}
      dimmed={!isSelected}
    />
  )
}


function ChamberInfo({
  roomId,
  chamberId,
}) {
  const { chamberExists } = useChamber(chamberId)

  const router = useRouter()

  const _enterRoom = () => {
    router.push(`/room/${roomId}`)
  }

  const compass = useMemo(() => coordToCompass(chamberId), [chamberId])

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
