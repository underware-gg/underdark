import ThreeJsCanvas from '../three/ThreeJsCanvas'
import * as game from '../three/game'

const GameCanvas = ({
  width = 900,
  height = 450,
  guiEnabled = false,
}) => {
  return <ThreeJsCanvas width={width} height={height} guiEnabled={guiEnabled} gameLoop={game} />
}

export default GameCanvas
