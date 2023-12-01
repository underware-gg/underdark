import React from 'react'
import { useAsciiText, deltaCorpsPriest1 } from 'react-ascii-text'
import App from '@/underdark/components/App'

export default function IndexPage() {
  //@ts-ignore
  const textStyle: UseAsciiTextArgs = {
    animationCharacters: '▒ ░ █',
    animationDirection: 'down',
    animationInterval: 0,
    animationLoop: false,
    animationSpeed: 20,
    font: deltaCorpsPriest1,
  }
  const TextRef = useAsciiText({
    ...textStyle,
    text: [' ', 'Underdark'],
  });

  return (
    <App>
      {/* @ts-ignore */}
      <pre ref={TextRef}></pre>

      <div className='Spacer20' />
      <h2><button onClick={() => { location.href = '/underdark/' }}>ENTER THE DARKNESS</button></h2>

      <div className='Spacer20' />
      <h2><button onClick={() => { location.href = '/editor/' }}>BITMAP EDITOR</button></h2>

    </App>
  );
}
