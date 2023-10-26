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
  EXIT: {
    path: '/models/door.fbx',
    scale: 0.005,
    rotation: [HALF_PI, HALF_PI, 0],
  },
  STAIRS: {
    path: '/models/stairs.fbx',
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
      onLoading(ASSETS[name], () => {
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
  return _loader(MODELS_ASSETS, (asset, resolve) => {
    loader.load(asset.path, function (object) {
      // load asset...
      console.log(`CACHED MODEL [${name}]:`, object, object?.scale)
      if (object) {
        if (asset.rotation) object.rotation.set(asset.rotation[0], asset.rotation[1], asset.rotation[2])
        if (asset.scale) object.scale.set(asset.scale, asset.scale, asset.scale)
        asset.object = object
        asset.loaded = true
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
