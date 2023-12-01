import React from 'react'
import { Container, Grid, Image } from 'semantic-ui-react'
import ManorRoomSelector from '@/underdark/components/ManorRoomSelector'

const Row = Grid.Row
const Col = Grid.Column

function Manor() {
  return (
    <Container>
      <div className='AlignCenter'>
        <Image className='ManorImage' src='/images/manor.jpg' />
        <h3>you are at</h3>
        <h1>The Manor at Kurnkunor</h1>
        <h2>The lair of the Slender Duck!</h2>
      </div>

      <hr />
      <Container text>
        <p>(concepts we need to pass)</p>

        <p>The Manor has <b>ten thousand</b> rooms, containign many perils and rewards.</p>

        <p>Each room is a passage to the Underdark, and can be composed of many levels. Find the exit to go deeper and deeper into the Underdark.</p>

        <p>
          Light and Sanity are your most precious resources. Keep your sanity by avoiding Underducks. Refill your light with Dark Tar.
          If your lights runs out... may the gods be mercyful on your soul, as the Slender Duck will find you and slay you!
        </p>

        <p>A treasure awaits at the bottom of each Underdark room. Only one player can collect each treasure.</p>

        <p>The deeper you go, the more dangerous it gets!</p>

        <p>May the light be with you...</p>

      </Container>

      <hr />

      <ManorRoomSelector />

    </Container>
  )
}

export default Manor
