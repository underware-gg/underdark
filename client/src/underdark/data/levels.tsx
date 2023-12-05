
//---------------------------------
// Chamber Generators
//
interface Generator {
  name: string
  value: number
  description: string
}

export const generators: Generator[] = [
  // debug
  { name: 'seed', value: 0, description: '' },
  { name: 'underseed', value: 0, description: '' },
  { name: 'overseed', value: 0, description: '' },
  { name: 'protected', value: 0, description: '' },
  // default entry
  { name: 'entry', value: 0, description: '' },
  // connections
  { name: 'connection', value: 0, description: 'narrow connection' },
  { name: 'connection', value: 1, description: 'wide connection' },
  { name: 'connection', value: 2, description: 'carved connection' },
  { name: 'connection', value: 2, description: 'wider carved connection' },
  // binary tree mazes
  { name: 'binary_tree_classic', value: 0, description: '' },
  { name: 'binary_tree_pro', value: 0, description: '' },
  { name: 'binary_tree_fuzz', value: 0, description: '' },
  // collapse
  { name: 'collapse', value: 0, description: 'collapse tight' },
  { name: 'collapse', value: 1, description: 'collapse wide' },
  // carver / automata
  { name: 'carve', value: 2, description: '' },
  { name: 'carve', value: 3, description: '' },
  { name: 'carve', value: 36, description: '' },
  { name: 'carve', value: 37, description: 'entry' },
  { name: 'carve', value: 4, description: '' },
  { name: 'carve', value: 44, description: '' },
  { name: 'carve', value: 45, description: '' },
  { name: 'carve', value: 46, description: '' },
  { name: 'carve', value: 47, description: '' },
  { name: 'carve', value: 5, description: '' },
  { name: 'carve', value: 44, description: '' },
  { name: 'carve', value: 45, description: '' },
  { name: 'carve', value: 46, description: '' },
  { name: 'carve', value: 47, description: '' },
  { name: 'carve', value: 54, description: '' },
  { name: 'carve', value: 55, description: 'OK' },
  { name: 'carve', value: 56, description: '' },
  { name: 'carve', value: 57, description: '' },
  { name: 'carve', value: 6, description: '' },
  { name: 'carve', value: 63, description: '' },
  { name: 'carve', value: 64, description: '' },
  { name: 'carve', value: 65, description: '' },
  { name: 'carve', value: 7, description: '' },
  { name: 'carve', value: 8, description: '' },
  { name: 'carve', value: 9, description: '' },
  // collapse
  { name: 'collapse_carve', value: 3, description: '' },
  { name: 'collapse_carve', value: 4, description: 'OK' },
  { name: 'collapse_carve', value: 5, description: 'OK' },
  { name: 'collapse_carve', value: 6, description: '' },
]

//-----------------------------------
// Levels
//

export type LevelParams = {
  generatorName: string
  generatorValue: number
  renderParams: any
}

export const levels: LevelParams[] = [
  {
    generatorName: 'entry',
    generatorValue: 0,
    // Game Boy
    renderParams: {
      colorCount: 16,
      palette: 1,
      bayer: 4,
    }
  },
  {
    generatorName: 'binary_tree_classic',
    generatorValue: 0,
    // BW Dither Band
    renderParams: {
      colorCount: 16,
      palette: 0,
      dither: 0.5,
      ditherSize: 4,
    }
  },
  {
    generatorName: 'binary_tree_pro',
    generatorValue: 0,
    // BW Dither hard
    renderParams: {
      gamma: 1,
      colorCount: 16,
      palette: 0,
      bayer: 4,
    }
  },
  {
    generatorName: 'binary_tree_fuzz',
    generatorValue: 0,
    renderParams: {
      colorCount: 16,
      palette: 2,
    }
  },
  {
    generatorName: 'carve',
    generatorValue: 55,
    renderParams: {
      colorCount: 16,
      palette: 3,
      bayer: 4,
    }
  },
  {
    generatorName: 'collapse_carve',
    generatorValue: 4,
    renderParams: {
      colorCount: 16,
      palette: 4,
      bayer: 4,
    }
  },
  {
    generatorName: 'collapse_carve',
    generatorValue: 5,
    renderParams: {
      colorCount: 16,
      palette: 5,
      dither: 0.5,
      ditherSize: 5,
    }
  },
  {
    generatorName: 'collapse',
    generatorValue: 1,
    renderParams: {
      palette: 6,
    }
  },
  {
    generatorName: 'carve',
    generatorValue: 37,
    renderParams: {
      palette: 7,
      lightness: true,
    }
  },
]

export const getLevelIndex = (yonder: number): number => {
  // return Math.floor(Math.random() * levels.length)
  // return Number(chamberId % BigInt(levels.length))
  return Math.max(0, yonder - 1) % levels.length
}
export const getLevelParams = (yonder: number): LevelParams => {
  return levels[getLevelIndex(yonder)]
}
