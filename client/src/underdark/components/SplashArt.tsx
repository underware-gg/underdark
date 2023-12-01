import React from 'react'
import { useAsciiText, deltaCorpsPriest1 } from 'react-ascii-text'

export default function SplashArt() {
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

  return <pre ref={TextRef}></pre>
}
