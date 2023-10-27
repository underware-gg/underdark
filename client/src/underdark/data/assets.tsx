// import * as THREE from 'three'
//@ts-ignore
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

const HALF_PI = Math.PI * 0.5


//----------------------------
// Assets
//

let MODELS_ASSETS = {
  MONSTER: {
    path: '/models/duck3.ok.fbx',
    scale: 0.005,
    rotation: [HALF_PI, 0, 0],
  },
  SLENDER_DUCK: {
    path: '/models/slendie.ok.fbx',
    scale: 0.005,
    rotation: [HALF_PI, 0, 0],
  },
  DARK_TAR: {
    path: '/models/tar.ok.fbx',
    scale: 0.005,
    rotation: [HALF_PI, 0, 0],
  },
  DOOR: {
    path: '/models/door.fbx',
    scale: 0.005,
    rotation: [HALF_PI, HALF_PI, 0],
  },
  STAIRS: {
    path: '/models/stairs.ok.fbx',
    scale: 0.005,
    rotation: [HALF_PI, HALF_PI, 0],
  },
  // CHEST: {
  //   path: '/models/chest.ok.fbx',
  //   scale: 0.005,
  //   rotation: [HALF_PI, 0, 0],
  // },
}



//----------------------------
// Loaders
//
// Generic loader
export const _loader = async (ASSETS, onLoading) => {
  return new Promise<void>((resolve, reject) => {
    let assetsToLoad = Object.keys(ASSETS).length
    Object.keys(ASSETS).forEach((name) => {
      onLoading(name, () => {
        if (--assetsToLoad == 0) {
          resolve()
        }
      })
    })
  })
}

//
// Models
export const _loadModels = async () => {
  const loader = new FBXLoader();
  return _loader(MODELS_ASSETS, (name, resolve) => {
    const model = MODELS_ASSETS[name]
    loader.load(model.path, function (object) {
      // load asset...
      console.log(`CACHED MODEL [${name}]:`, object, object?.scale)
      if (object) {
        if (model.rotation) object.rotation.set(model.rotation[0], model.rotation[1], model.rotation[2])
        if (model.scale) object.scale.set(model.scale, model.scale, model.scale)
        model.object = object
        model.loaded = true
      }
      // loaded
      resolve()
    });
  })
}


//----------------------------
// Main Asset Loader
//
let _loadingAssets
const loadAssets = async () => {
  // create / return loading promise
  if (_loadingAssets === undefined) {
    _loadingAssets = true
    // load all assets...
    await _loadModels()
    _loadingAssets = false
  }
  return _loadingAssets
}

export {
  loadAssets,
  MODELS_ASSETS,
}
