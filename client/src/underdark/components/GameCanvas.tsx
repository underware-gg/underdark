import ThreeJsCanvas from '@/underdark/three/ThreeJsCanvas'
import * as game from '@/underdark/three/game'

const GameCanvas = ({
  width = 960,
  height = 540,
  guiEnabled = false,
}) => {
  return <ThreeJsCanvas width={width} height={height} guiEnabled={guiEnabled} gameImpl={game} />
}

export default GameCanvas
