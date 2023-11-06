import * as THREE from 'three'
//@ts-ignore
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'

const HALF_PI = Math.PI * 0.5


//----------------------------
// Model Assets
//
export enum ModelName {
  MONSTER = 'MONSTER',
  SLENDER_DUCK = 'SLENDER_DUCK',
  DARK_TAR = 'DARK_TAR',
  DOOR = 'DOOR',
  STAIRS = 'STAIRS',
}

let MODELS_ASSETS = {
  [ModelName.MONSTER]: {
    path: '/models/duck3.ok.fbx',
    scale: 0.005,
    rotation: [HALF_PI, 0, 0],
  },
  [ModelName.SLENDER_DUCK]: {
    path: '/models/slendie.ok.fbx',
    scale: 0.005,
    rotation: [HALF_PI, 0, 0],
  },
  [ModelName.DARK_TAR]: {
    path: '/models/tar.ok.fbx',
    scale: 0.005,
    rotation: [HALF_PI, 0, 0],
  },
  [ModelName.DOOR]: {
    path: '/models/door.fbx',
    scale: 0.005,
    rotation: [HALF_PI, HALF_PI, 0],
  },
  [ModelName.STAIRS]: {
    path: '/models/stairs.ok.fbx',
    scale: 0.005,
    rotation: [HALF_PI, HALF_PI, 0],
  },
  // [ModelName.CHEST]: {
  //   path: '/models/chest.ok.fbx',
  //   scale: 0.005,
  //   rotation: [HALF_PI, 0, 0],
  // },
}


//----------------------------
// Audio Assets
//
export enum AudioName {
  AMBIENT = 'AMBIENT',
  SLENDER_DUCK = 'SLENDER_DUCK',
}

let AUDIO_ASSETS = {
  AMBIENT: {
    path: '/audio/music-ambient.mp3',
    loop: true,
  },
  SLENDER_DUCK: {
    path: '/audio/sfx/slenderduck.mp3',
    loop: true,
  },
}



//----------------------------
// Loaders
//
// Generic loader
export const _loader = async (ASSETS, onLoading) => {
  return new Promise<void>((resolve, reject) => {
    let assetsToLoad = Object.keys(ASSETS).length
    Object.keys(ASSETS).forEach((name) => {
      onLoading(name, (object) => {
        ASSETS[name].object = object
        ASSETS[name].loaded = (object != null)
        if (--assetsToLoad == 0) {
          resolve()
        }
      })
    })
  })
}

//-----------------
// Models
//
export const _loadModels = async () => {
  const loader = new FBXLoader()
  return _loader(MODELS_ASSETS, (name, resolve) => {
    const asset = MODELS_ASSETS[name]
    loader.load(asset.path, function (object) {
      // load asset...
      // console.log(`CACHED MODEL [${name}]:`, object, object?.scale)
      if (object) {
        if (asset.rotation) object.rotation.set(asset.rotation[0], asset.rotation[1], asset.rotation[2])
        if (asset.scale) object.scale.set(asset.scale, asset.scale, asset.scale)
      }
      resolve(object ?? null)
    })
  })
}

//-----------------
// Audios
//
export const _loadAudios = async (listener) => {
  const loader = new THREE.AudioLoader()
  return _loader(AUDIO_ASSETS, (name, resolve) => {
    const asset = AUDIO_ASSETS[name]
    loader.load(asset.path, function (buffer) {
      // load asset...
      let audio = null
      console.log(`CACHED AUDIO [${name}]:`, buffer)
      if (buffer) {
        audio = new THREE.Audio(listener).setBuffer(buffer)
        audio.setLoop(asset.loop ?? false)
        audio.setVolume(1.0)
        audio.autoplay = false
      }
      resolve(audio)
    })
  })
}



//----------------------------
// Main Asset Loader
//
let _loadingAssets
const loadAssets = async (cameraRig) => {
  // create / return loading promise
  if (_loadingAssets === undefined) {
    // create audio listener
    const listener = new THREE.AudioListener()
    cameraRig.add(listener)
    // load all assets...
    _loadingAssets = true
    await _loadModels()
    await _loadAudios(listener)
    _loadingAssets = false
  }
  return _loadingAssets
}

export {
  loadAssets,
  MODELS_ASSETS,
}
