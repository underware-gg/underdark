import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js'

// event emitter
// var ee = require('event-emitter');
import ee from 'event-emitter'
export var emitter = ee()

//@ts-ignore
import Stats from 'three/addons/libs/stats.module.js'
//@ts-ignore
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'

import { DepthPostShader } from '@/underdark/three/DepthPostShader'
import { Dir, GameTilemap, Position, TileType } from '@/underdark/utils/underdark'
import { loadAssets, ModelName, AudioName, MODELS_ASSETS, AUDIO_ASSETS } from '@/underdark/data/assets'
import { toRadians } from '@/underdark/utils/utils'

const PI = Math.PI
const HALF_PI = Math.PI * 0.5
const ONE_HALF_PI = Math.PI * 1.5
const TWO_PI = Math.PI * 2
const R_TO_D = (180 / Math.PI)

//
// Depth render based on:
// https://threejs.org/examples/#webgl_depth_texture
// https://github.com/mrdoob/three.js/blob/master/examples/webgl_depth_texture.html
//

const SIZE = 1;
const CAM_FOV = 70;
const CAM_FAR = 5; // 1.3 .. 5
const TILT = 1;
const GAMMA = 1.25;
const COLOR_COUNT = 0; //16;
const DITHER = 0;
const DITHER_SIZE = 4;
const BAYER = 0;//4;
const PALETTE = 0;//1;

const PALETTE_PATHS = [
  '/colors/gameboy.png',
  '/colors/blue.png',
  '/colors/pink.png',
  '/colors/purple.png',
  '/colors/earth.png',
  '/colors/hot.png',
  '/colors/spectrum.png',
  // '/colors/greeny.png',
]

let _width: number;
let _height: number;
let _aspect: number;
let _eyeZ: number;
let _palettes = [];
let _gameTilemap: GameTilemap | null = null
let _stepCounter = 0
let _animSecs = 200;
let _animSecsDamage = 500;

let _animationRequest = null
let _renderer: THREE.WebGLRenderer;
let _camera: THREE.PerspectiveCamera;
let _cameraRig: THREE.Object3D;
let _scene: THREE.Scene
let _material: THREE.Material;
let _tile_geometry: THREE.BoxGeometry;
let _tile_floor_geometry: THREE.PlaneGeometry;
let _damage: THREE.Object3D;
let _map: THREE.Object3D;
let _target, _postScene, _postCamera, _postMaterial;
let _playerPosition = { x: 0, y: 0, z: 0 };
let _supportsExtension: boolean = true;
let _gui
let _stats;
// let _controls;

let _defaultPosition: Position = { tile: 8, facing: Dir.South }

const defaultParams = {
  fov: CAM_FOV,
  far: CAM_FAR,
  tilt: TILT,
  gamma: GAMMA,
  colorCount: COLOR_COUNT,
  dither: DITHER,
  ditherSize: DITHER_SIZE,
  bayer: BAYER,
  palette: PALETTE,
  lightness: false,
  noiseAmount: 0.01,
  noiseSize: 10.0,
  ceilingHeight: 1.0,
};
let params = { ...defaultParams };


export function resetGameParams(newParams: any = {}) {
  // console.log(`resetGameParams() + `, newParams)
  Object.keys(defaultParams).forEach(key => {
    params[key] = newParams?.[key] ?? defaultParams[key]
  })
  _gui?.controllersRecursive().forEach(c => c.updateDisplay())
  paramsUpdated()
}

export function setGameParams(newParams: any) {
  // console.log(`setGameParams()`, newParams)
  Object.keys(newParams).forEach(key => {
    params[key] = newParams[key]
  })
  _gui?.controllersRecursive().forEach(c => c.updateDisplay())
  paramsUpdated()
}



//-------------------------------------------
// Setup
//

export function dispose() {
  if (_animationRequest) cancelAnimationFrame(_animationRequest)
  _animationRequest = null
  _renderer?.dispose()
  _renderer = null
  _scene = null
}

export async function init(canvas, width, height, guiEnabled) {

  if (_scene) return;

  _width = width;
  _height = height;
  _aspect = (width / height);
  _eyeZ = SIZE / 2;

  _renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    canvas,
  });

  if (_renderer.capabilities.isWebGL2 === false && _renderer.extensions.has('WEBGL_depth_texture') === false) {
    _supportsExtension = false;
    console.error(`WEBGL_depth_texture not supported!`)
    return;
  }

  _renderer.setPixelRatio(window.devicePixelRatio);
  _renderer.setSize(_width, _height);

  setupScene();

  _cameraRig = new THREE.Object3D();
  _cameraRig.position.set(0, 0, 0);
  _scene.add(_cameraRig)

  _camera = new THREE.PerspectiveCamera(
    CAM_FOV,  // fov
    _aspect,  // aspect
    0.01,     // near
    CAM_FAR,  // far
  );
  _cameraRig.add(_camera)
  _camera.up.set(0, 0, 1);
  _camera.position.set(0, 0, _eyeZ)
  _camera.lookAt(0, -SIZE, _eyeZ);

  // _controls = new OrbitControls(camera, renderer.domElement);
  // _controls.enableDamping = true;

  PALETTE_PATHS.forEach(path => {
    const tex = new THREE.TextureLoader().load(path);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    _palettes.push(tex);
  })

  setupRenderTarget();
  setupPost();

  onWindowResize();
  window.addEventListener('resize', onWindowResize);

  if (guiEnabled !== null) {
    _gui = new GUI({ width: 300 });
    _gui.add(params, 'fov', 30, 90, 1).onChange(guiUpdated);
    _gui.add(params, 'far', 1, 20, 0.1).onChange(guiUpdated);
    _gui.add(params, 'tilt', 0, 15, 0.1).onChange(guiUpdated);
    _gui.add(params, 'gamma', 0, 2, 0.01).onChange(guiUpdated);
    _gui.add(params, 'colorCount', 0, 16, 1).onChange(guiUpdated);
    _gui.add(params, 'dither', 0, 0.5, 0.01).onChange(guiUpdated);
    _gui.add(params, 'ditherSize', 2, 5, 1).onChange(guiUpdated);
    _gui.add(params, 'bayer', 0, 4, 1).onChange(guiUpdated);
    _gui.add(params, 'palette', 0, _palettes.length, 1).onChange(guiUpdated);
    _gui.add(params, 'lightness', true).onChange(guiUpdated);
    _gui.add(params, 'noiseAmount', 0, 1, 0.001).onChange(guiUpdated);
    _gui.add(params, 'noiseSize', 1, 100, 1).onChange(guiUpdated);
    // _gui.add(params, 'ceilingHeight', 1, 5, 0.25).onChange(guiUpdated);
    if (guiEnabled) {
      _gui.open();
    } else {
      _gui.close();
    }
    // framerate
    _stats = new Stats();
    document.body.appendChild(_stats.dom);
  }

  await loadAssets();
}

export function getCameraRig() {
  return _cameraRig
}

function guiUpdated() {
  paramsUpdated()
}

function paramsUpdated() {
  // Camera
  _camera.fov = params.fov;
  _camera.far = params.far;
  _camera.updateProjectionMatrix();
  _postMaterial.uniforms.uCameraNear.value = _camera.near;
  _postMaterial.uniforms.uCameraFar.value = _camera.far;
  _postMaterial.uniforms.uCameraFov.value = toRadians(_camera.fov);
  // Shader
  _postMaterial.uniforms.uGamma.value = params.gamma;
  _postMaterial.uniforms.uColorCount.value = params.colorCount;
  _postMaterial.uniforms.uDither.value = params.dither;
  _postMaterial.uniforms.uDitherSize.value = params.ditherSize;
  _postMaterial.uniforms.uBayer.value = params.bayer;
  _postMaterial.uniforms.uPalette.value = params.palette;
  _postMaterial.uniforms.tPalette.value = params.palette > 0 ? _palettes[params.palette - 1] : null;
  _postMaterial.uniforms.uLightness.value = params.lightness;
  _postMaterial.uniforms.uNoiseAmount.value = params.noiseAmount;
  _postMaterial.uniforms.uNoiseSize.value = params.noiseSize;
}

// Create a render target with depth texture
// const formats = { DepthFormat: THREE.DepthFormat, DepthStencilFormat: THREE.DepthStencilFormat };
// const types = { UnsignedShortType: THREE.UnsignedShortType, UnsignedIntType: THREE.UnsignedIntType, UnsignedInt248Type: THREE.UnsignedInt248Type };
function setupRenderTarget() {
  if (_target) _target.dispose();
  const format = THREE.DepthFormat;
  const type = THREE.UnsignedShortType;
  _target = new THREE.WebGLRenderTarget(_width, _height);
  _target.texture.minFilter = THREE.NearestFilter;
  _target.texture.magFilter = THREE.NearestFilter;
  // _target.stencilBuffer = (format === THREE.DepthStencilFormat) ? true : false;
  //@ts-ignore
  _target.depthTexture = new THREE.DepthTexture();
  _target.depthTexture.format = format;
  _target.depthTexture.type = type;
}

function setupPost() {
  _postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  _postMaterial = new THREE.ShaderMaterial({
    vertexShader: DepthPostShader.vertexShader,
    fragmentShader: DepthPostShader.fragmentShader,
    uniforms: {
      uCameraNear: { value: _camera.near },
      uCameraFar: { value: _camera.far },
      uCameraFov: { value: _camera.fov },
      uGamma: { value: GAMMA },
      uColorCount: { value: COLOR_COUNT },
      uDither: { value: DITHER },
      uDitherSize: { value: DITHER_SIZE },
      uBayer: { value: BAYER },
      uPalette: { value: params.palette },
      uLightness: { value: params.lightness },
      uNoiseAmount: { value: params.noiseAmount },
      uNoiseSize: { value: params.noiseSize },
      uTime: { value: 0.0 },
      tPalette: { value: null },
      tDiffuse: { value: null },
      tDepth: { value: null }
    }
  });
  guiUpdated();
  const postPlane = new THREE.PlaneGeometry(2, 2);
  const postQuad = new THREE.Mesh(postPlane, _postMaterial);
  _postScene = new THREE.Scene();
  _postScene.add(postQuad);
  postQuad.scale.set(-1, 1, 1);
}

function onWindowResize() {
  // const aspect = window.innerWidth / window.innerHeight;
  // camera.aspect = aspect;
  // camera.updateProjectionMatrix();
  // const dpr = renderer.getPixelRatio();
  // target.setSize(window.innerWidth * dpr, window.innerHeight * dpr);
  // renderer.setSize(window.innerWidth, window.innerHeight);
}


//-------------------------------------------
// Game Loop
//

export function animate(time) {
  if (!_supportsExtension || !_scene || !_renderer) return;

  _animationRequest = requestAnimationFrame(animate);

  _postMaterial.uniforms.uTime.value = time / 1000.0;

  TWEEN.update();

  // render scene into target
  _renderer.setRenderTarget(_target);
  _renderer.render(_scene, _camera);

  // render post FX
  _postMaterial.uniforms.tDiffuse.value = _target.texture;
  _postMaterial.uniforms.tDepth.value = _target.depthTexture;

  _renderer.setRenderTarget(null);
  _renderer.render(_postScene, _postCamera);

  if (_stats) _stats.update();
}


//-------------------------------------------
// Scene
//

function setupScene() {

  _scene = new THREE.Scene();

  _material = new THREE.MeshBasicMaterial({ color: 'blue' });
  _tile_geometry = new THREE.BoxGeometry(SIZE, SIZE, SIZE * params.ceilingHeight);
  _tile_floor_geometry = new THREE.PlaneGeometry(SIZE, SIZE);

  const floor_geometry = new THREE.PlaneGeometry(16 * SIZE, 16 * SIZE);
  const ceiling_geometry = new THREE.PlaneGeometry(20 * SIZE, 20 * SIZE);
  const floor_material = new THREE.MeshBasicMaterial({ color: 'cyan' });
  const floor = new THREE.Mesh(floor_geometry, floor_material);
  const ceiling = new THREE.Mesh(ceiling_geometry, floor_material);
  floor.position.set(7.5 * SIZE, 7.5 * SIZE, 0);
  ceiling.position.set(8 * SIZE, 8 * SIZE, SIZE * params.ceilingHeight);
  ceiling.scale.set(1, 1, -1);

  _damage = new THREE.Object3D();
  _damage.scale.set(0, 0, 0);
  const damage_geometry = new THREE.TorusKnotGeometry(10, 3, 64, 8)
  const damage_mesh = new THREE.Mesh(damage_geometry, _material)
  damage_mesh.scale.set(0.05, 0.05, 0.05)
  damage_mesh.position.set(0, 0, SIZE * 0.5)
  _damage.add(damage_mesh)

  _scene.add(floor)
  _scene.add(ceiling)
  _scene.add(_damage)
}

export function movePlayer(tile: number | null) {
  const _tile = tile ?? _defaultPosition.tile
  const x = (_tile % 16) * SIZE
  const y = Math.floor(_tile / 16) * SIZE
  _playerPosition = { x, y, z: 0 }
  new TWEEN.Tween(_cameraRig.position)
    .to({ x, y }, _animSecs)
    .onUpdate(() => {
      emitter.emit('movedTo', { x: _cameraRig.position.x, y: _cameraRig.position.y, z: _cameraRig.position.z })
    })
    .start()
  // _cameraRig.position.set(x, y, 0);
}

export function rotatePlayer(facing: Dir | null) {
  const _facing = facing ?? _defaultPosition.facing
  let tilt = (++_stepCounter % 2 == 0 ? params.tilt : -params.tilt) / R_TO_D
  let rotX = (_facing == Dir.East || _facing == Dir.West) ? tilt : 0
  let rotY = (_facing == Dir.North || _facing == Dir.South) ? tilt : 0
  let rotZ =
    _facing == Dir.East ? HALF_PI
      : _facing == Dir.South ? PI
        : _facing == Dir.West ? ONE_HALF_PI
          : 0
  if (_cameraRig.rotation.z - rotZ > PI) rotZ += TWO_PI
  if (rotZ - _cameraRig.rotation.z > PI) rotZ -= TWO_PI
  new TWEEN.Tween(_cameraRig.rotation)
    .to({ x: rotX, y: rotY, z: rotZ }, _animSecs)
    .onUpdate(() => {
      emitter.emit('rotatedTo', { x: _cameraRig.rotation.x, y: _cameraRig.rotation.y, z: _cameraRig.rotation.z })
    })
    .start()
    .onComplete(() => {
      if (_cameraRig.rotation.z < 0) _cameraRig.rotation.z += TWO_PI;
      if (_cameraRig.rotation.z > TWO_PI) _cameraRig.rotation.z -= TWO_PI;
      emitter.emit('rotatedTo', { x: _cameraRig.rotation.x, y: _cameraRig.rotation.y, z: _cameraRig.rotation.z })
    })
  // _cameraRig.rotation.set(0, 0, rot);

}

// export function getPlayerRotation() {
//   return _cameraRig.rotation.z
// }

export function setupMap(gameTilemap: GameTilemap | null, isPlaying: boolean) {

  _gameTilemap = gameTilemap ?? {
    gridSize: 20,
    gridOrigin: { x: 0, y: 0 },
    playerStart: _defaultPosition,
    tilemap: [],
    tiles: [],
  }

  const gridSize = _gameTilemap.gridSize
  const gridOrigin = _gameTilemap.gridOrigin
  const tilemap = _gameTilemap.tilemap
  const tiles = _gameTilemap.tiles

  if (_map) {
    _scene.remove(_map)
  }

  _map = new THREE.Object3D();
  _map.position.set(0, 0, 0);

  const _randomRotate = (mesh) => (mesh.rotation.set(0, 0, [0, 1, 2, 3][Math.floor(Math.random() * 4)] * HALF_PI))

  // console.log(gameTilemap)
  for (let i = 0; i < tilemap.length; ++i) {
    const tileType = tilemap[i]
    const x = ((i % gridSize) + gridOrigin.x) * SIZE
    const y = (Math.floor(i / gridSize) + gridOrigin.y) * SIZE
    let z = 0
    let meshes = []
    if (tileType == TileType.Void) {
      meshes.push(new THREE.Mesh(_tile_geometry, _material))
      z = SIZE * params.ceilingHeight * 0.5
    } else if (tileType == TileType.Entry) {
      meshes.push(loadModel(ModelName.DOOR))
      meshes.push(new THREE.Mesh(_tile_floor_geometry, _material))
    } else if (tileType == TileType.Exit) {
      meshes.push(loadModel(ModelName.STAIRS))
    } else if (tileType == TileType.LockedExit) {
    } else if (tileType == TileType.Monster) {
      meshes.push(loadModel(ModelName.MONSTER))
      _randomRotate(meshes[0])
      meshes[0].visible = isPlaying
    } else if (tileType == TileType.SlenderDuck) {
      meshes.push(loadModel(ModelName.SLENDER_DUCK))
      _randomRotate(meshes[0])
      meshes[0].visible = isPlaying
    } else if (tileType == TileType.DarkTar) {
      meshes.push(loadModel(ModelName.DARK_TAR))
      _randomRotate(meshes[0])
      meshes[0].scale.set(1, 1, params.ceilingHeight)
      meshes[0].visible = isPlaying
    }
    meshes.forEach((mesh) => {
      mesh.underData = {
        tile: tiles[i],
        tileType,
      }
      mesh.position.set(x, y, z)
      _map.add(mesh)
    })
  }

  _scene.add(_map)
}

function loadModel(name: ModelName) {
  const asset = MODELS_ASSETS[name]
  if (!asset?.object) return null
  // console.log(`___MODEL_instance`, name, model.object)
  const obj = new THREE.Object3D();
  obj.add(asset.object.clone())
  return obj
}

export function enableTilesByType(tileType: TileType, enabled: boolean) {
  _map.children.forEach((object) => {
    //@ts-ignore
    if (object.underData?.tileType === tileType) {
      object.visible = enabled
    }
  })
}

function _findTile(tile: number): THREE.Object3D | null {
  for (let i = 0; i < _map.children.length; ++i) {
    const object = _map.children[i]
    //@ts-ignore
    if (object.underData?.tile === tile) return object
  }
  return null
}

export function disableTile(tile: number) {
  const object = _findTile(tile)
  if (object) {
    object.visible = false
  }
}

export function isTileEnaled(tile: number): boolean {
  const object = _findTile(tile)
  return object?.visible ?? false
}

export function damageFromTile(tile: number) {
  const object = _findTile(tile)
  if (!object) return
  _damage.position.set(object.position.x, object.position.y, 0)
  _damage.rotation.set(0, 0, 0)
  new TWEEN.Tween(_damage.scale)
    .to({ x: 1.5, y: 1.5, z: 1.5 }, _animSecsDamage)
    .start()
    .onComplete(() => _damage.scale.set(0, 0, 0))
  new TWEEN.Tween(_damage.rotation)
    .to({ x: 0, y: 0, z: PI * 4 }, _animSecsDamage)
    .start()
}

export function rotateToPlayer(tile: number) {
  const object = _findTile(tile)
  if (!object) return
  const a = -HALF_PI + Math.atan2(object.position.y - _playerPosition.y, object.position.x - _playerPosition.x)
  new TWEEN.Tween(object.rotation)
    .to({ x: 0, y: 0, z: a }, _animSecs)
    .start()
}

export function rotatePlayerTo(tile: number) {
  const object = _findTile(tile)
  if (!object) return
  if (_playerPosition.y == object.position.y && _playerPosition.x == object.position.x) return
  const a = -HALF_PI + Math.atan2(_playerPosition.y - object.position.y, _playerPosition.x - object.position.x)
  new TWEEN.Tween(_cameraRig.rotation)
    .to({ x: 0, y: 0, z: a }, _animSecs)
    .start()
}


//-------------------------------
// Audio
//
export function playAudio(name: AudioName, enabled: boolean = true) {
  const asset = AUDIO_ASSETS[name]
  if (asset?.object) {
    if (asset.object.isPlaying) {
      asset.object.stop()
    }
    if (enabled) {
      asset.object.play()
    }
  }
}

export function pauseAudio(name: AudioName) {
  const asset = AUDIO_ASSETS[name]
  asset?.object?.pause()
}

export function stopAudio(name: AudioName) {
  const asset = AUDIO_ASSETS[name]
  asset?.object?.stop()
}

export function playFootstep() {
  const assetName = _stepCounter % 2 == 0 ? AudioName.FOOT1 : AudioName.FOOT2
  playAudio(assetName)
}
