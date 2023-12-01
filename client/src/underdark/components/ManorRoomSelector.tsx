import React, { useMemo } from 'react'
import { Segment, Grid, Container } from 'semantic-ui-react'
import GameView from '@/underdark/components/GameView'
import GameUI from '@/underdark/components/GameUI'
import { useAllChamberIds, useChamber } from '@/underdark/hooks/useChamber'
import { useUnderdarkContext } from '@/underdark/hooks/UnderdarkContext'
import { coordToSlug } from '@/underdark/utils/underdark'
import { bigintToHex } from '@/underdark/utils/utils'

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
  const { chamberId: selectedChamberId } = useUnderdarkContext()
  const { chamberIds } = useAllChamberIds()
  console.log(`SELECTED:`, selectedChamberId)

  const rows = useMemo(() => {
    let result = []
    chamberIds.forEach(chamberId => {
      result.push(
        <RoomRow key={`row_${chamberId}`}
          chamberId={chamberId}
          isSelected={chamberId == selectedChamberId}
        />
      )
    })
    return result
  }, [chamberIds])
  // console.log(chamberIds)

  return rows
}


function RoomRow({
  chamberId,
  isSelected,
}) {
  const { minter, domain_id, token_id, yonder, chamberExists } = useChamber(chamberId)

  
  return (
    <Row>
      <Col width={8}>
        {chamberId.toString()}
      </Col>
      <Col width={8}>
        {isSelected &&
          <RoomInfo chamberId={chamberId} />
        }
      </Col>
    </Row>
  )
}

function RoomInfo({
  chamberId
}) {
  const { minter, domain_id, token_id, yonder, chamberExists } = useChamber(chamberId)

  return (
    <div>
      {bigintToHex(chamberId)}
      <br />
      <b>({coordToSlug(chamberId, yonder)})</b>
      <br />
      <button>ENTER ROOM</button>
      </div>
  )
}


export default ManorRoomSelector
