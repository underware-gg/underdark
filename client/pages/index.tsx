import React from 'react'
import Link from 'next/link'
import { Image } from 'semantic-ui-react'
import App from '@/underdark/components/App'
// import SplashArt from '@/underdark/components/SplashArt';

export default function IndexPage() {

  return (
    <App>

      <Link href='/gate'>
        <Image className='Logo' src='/images/logo.png' />
      </Link>

      {/* <SplashArt /> */}

      {/* <div className='Spacer20' /> */}
      {/* <h2><button onClick={() => { location.href = '/manor' }}>Enter The Manor at Kurnkunor</button></h2> */}

      {/* <div className='Spacer20' /> */}
      {/* <h2><button onClick={() => { location.href = '/editor/' }}>BITMAP EDITOR</button></h2> */}


      <div className='Spacer20' />

      <div className='AlignCenter'>
        <a href='https://lootunder.world/underdark'>Underdark</a>
        <br />
        by <a href='https://lootunder.world'>Team Underworld</a>
        <br />
        <a href='https://x.com/LootUnderworld'>@LootUnderworld</a>
      </div>

    </App>
  );
}
