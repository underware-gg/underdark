import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js'

//@ts-ignore
import Stats from 'three/addons/libs/stats.module.js'
//@ts-ignore
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
//@ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
//@ts-ignore
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

import { DepthPostShader } from './DepthPostShader'
import { Dir, GameTilemap, Position, TileType } from '../utils/underdark'

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

let _animationRequest = null
let _renderer: THREE.WebGLRenderer;
let _camera: THREE.PerspectiveCamera;
let _cameraRig: THREE.Object3D;
let _scene: THREE.Scene
let _map: THREE.Object3D;
let _target, _postScene, _postCamera, _postMaterial;
let _supportsExtension: boolean = true;
let _gui
let _stats;
// let _controls;

let _tile_geometry;
let _monster_geometry;
let _slender_geometry;
let _tar_geometry;
let _door_geometry;
let _material: THREE.Material;

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
};
let params = defaultParams;


export function resetGameParams(moreParams: any = {}) {
  console.log(`resetGameParams() + `, moreParams)
  params = {
    ...defaultParams,
    ...moreParams,
  }
  paramsUpdated()
  // _gui?.controllersRecursive().forEach(c => c.updateDisplay())
}

export function setGameParams(moreParams: any) {
  console.log(`setGameParams()`, moreParams)
  params = {
    ...params,
    ...moreParams,
  }
  paramsUpdated()
  // _gui?.controllersRecursive().forEach(c => c.updateDisplay())
}



//-------------------------------------------
// Models
//

let MODELS = {
  // MONSTER: { path: '/models/duck3.fbx', scale: 0.02 },
  // SLENDER_DUCK: { path: '/models/slendie.fbx', scale: 0.5 },
  // DARK_TAR: { path: '/models/tar.fbx', scale: 0.5 },
  // EXIT: { path: '/models/door.fbx', scale: 0.5 },
} 

function _loadModels() {
  // load models
  const loader = new FBXLoader();
  Object.keys(MODELS).forEach(key => {
    let model = MODELS[key]
    if (!model.object) {
      console.log(`CACHING MODEL...`, model)
      loader.load(model.path, function (object) {
        console.log(`FBX OBJECT:`, object, object.scale)
        if (object) {
          object.scale.set(model.scale, model.scale, model.scale)
          model.object = object
          model.loaded = true
        }
      });
    }
  });
}

_loadModels();



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

  if (guiEnabled) {
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
    _gui.open();
    // framerate
    _stats = new Stats();
    document.body.appendChild(_stats.dom);
  }
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
  // Shader
  _postMaterial.uniforms.uGamma.value = params.gamma;
  _postMaterial.uniforms.uColorCount.value = params.colorCount;
  _postMaterial.uniforms.uDither.value = params.dither;
  _postMaterial.uniforms.uDitherSize.value = params.ditherSize;
  _postMaterial.uniforms.uBayer.value = params.bayer;
  _postMaterial.uniforms.uPalette.value = params.palette;
  _postMaterial.uniforms.tPalette.value = params.palette > 0 ? _palettes[params.palette - 1] : null;
  _postMaterial.uniforms.uLightness.value = params.lightness;
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
      uGamma: { value: GAMMA },
      uColorCount: { value: COLOR_COUNT },
      uDither: { value: DITHER },
      uDitherSize: { value: DITHER_SIZE },
      uBayer: { value: BAYER },
      uPalette: { value: params.palette },
      uLightness: { value: params.lightness },
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
  postQuad.scale.set(-1,1,1);
}

function onWindowResize() {
  // const aspect = window.innerWidth / window.innerHeight;
  // camera.aspect = aspect;
  // camera.updateProjectionMatrix();
  // const dpr = renderer.getPixelRatio();
  // target.setSize(window.innerWidth * dpr, window.innerHeight * dpr);
  // renderer.setSize(window.innerWidth, window.innerHeight);
}

// function makeTorus(scene) {
//   const geometry = new THREE.TorusKnotGeometry(1, 0.3, 128, 64);
//   const material = new THREE.MeshBasicMaterial({ color: 'blue' });
//   const count = 50;
//   const scale = 5;
//   for (let i = 0; i < count; i++) {
//     const r = Math.random() * 2.0 * PI;
//     const z = (Math.random() * 2.0) - 1.0;
//     const zScale = Math.sqrt(1.0 - z * z) * scale;
//     const mesh = new THREE.Mesh(geometry, material);
//     mesh.position.set(
//       Math.cos(r) * zScale,
//       Math.sin(r) * zScale,
//       z * scale
//     );
//     mesh.rotation.set(Math.random(), Math.random(), Math.random());
//     scene.add(mesh);
//   }
// }


//-------------------------------------------
// Game Loop
//

export function animate() {
  if (!_supportsExtension || !_scene || !_renderer) return;

  _animationRequest = requestAnimationFrame(animate);

  TWEEN.update();

  // render scene into target
  _renderer.setRenderTarget(_target);
  _renderer.render(_scene, _camera);

  // render post FX
  _postMaterial.uniforms.tDiffuse.value = _target.texture;
  _postMaterial.uniforms.tDepth.value = _target.depthTexture;

  _renderer.setRenderTarget(null);
  _renderer.render(_postScene, _postCamera);

  // _controls.update(); // required because damping is enabled

  // _stats.update();
}


//-------------------------------------------
// Scene
//

function setupScene() {

  _scene = new THREE.Scene();

  _material = new THREE.MeshBasicMaterial({ color: 'blue' });

  _tile_geometry = new THREE.BoxGeometry(SIZE, SIZE, SIZE);
  // _monster_geometry = new THREE.BoxGeometry(SIZE / 4, SIZE / 4, SIZE / 4);
  _tar_geometry = new THREE.IcosahedronGeometry(SIZE / 4);
  _slender_geometry =new THREE.ConeGeometry(SIZE / 4, SIZE * 0.75, 16)

  const shape = new THREE.Shape();
  const x = -2.5;
  const y = -5;
  shape.moveTo(x + 2.5, y + 2.5);
  shape.bezierCurveTo(x + 2.5, y + 2.5, x + 2, y, x, y);
  shape.bezierCurveTo(x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5);
  shape.bezierCurveTo(x - 3, y + 5.5, x - 1.5, y + 7.7, x + 2.5, y + 9.5);
  shape.bezierCurveTo(x + 6, y + 7.7, x + 8, y + 4.5, x + 8, y + 3.5);
  shape.bezierCurveTo(x + 8, y + 3.5, x + 8, y, x + 5, y);
  shape.bezierCurveTo(x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5);
  const extrudeSettings = {
    steps: 1,
    depth: 1.0,
    bevelEnabled: true,
    bevelThickness: 0.10,
    bevelSize: 0.10,
    bevelSegments: 0,
  };
  _door_geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);


  const radius = 3.5;
  const tubeRadius = 1.1;
  const radialSegments = 7;
  const tubularSegments = 58;
  const p = 2;
  const q = 3;
  _monster_geometry = new THREE.TorusKnotGeometry(radius, tubeRadius, tubularSegments, radialSegments, p, q);


  const floor_geometry = new THREE.PlaneGeometry(40 * SIZE, 40 * SIZE);
  const floor_material = new THREE.MeshBasicMaterial({ color: 'cyan' });
  const floor = new THREE.Mesh(floor_geometry, floor_material);
  const ceiling = new THREE.Mesh(floor_geometry, floor_material);
  floor.position.set(-SIZE * 2, -SIZE * 2, 0);
  ceiling.position.set(-SIZE * 2, -SIZE * 2, SIZE);
  ceiling.scale.set(1, 1, -1);

  _scene.add(floor);
  _scene.add(ceiling);

  // makeTorus(_scene);
}

export function movePlayer(position: Position) {
  const x = (position.tile % 16) * SIZE
  const y = Math.floor(position.tile / 16) * SIZE
  new TWEEN.Tween(_cameraRig.position).to({ x, y }, 100).start()
  // _cameraRig.position.set(x, y, 0);

  // Rotate player
  let tilt = (++_stepCounter % 2 == 0 ? params.tilt : -params.tilt) / R_TO_D
  let rotX = (position.facing == Dir.East || position.facing == Dir.West) ? tilt : 0
  let rotY = (position.facing == Dir.North || position.facing == Dir.South) ? tilt : 0
  let rotZ =
    position.facing == Dir.East ? HALF_PI
      : position.facing == Dir.South ? PI
        : position.facing == Dir.West ? ONE_HALF_PI
          : 0
  if (_cameraRig.rotation.z - rotZ > PI) rotZ += TWO_PI
  if (rotZ - _cameraRig.rotation.z > PI) rotZ -= TWO_PI
  new TWEEN.Tween(_cameraRig.rotation).to({ x: rotX, y: rotY, z: rotZ }, 100).start().onComplete(() => {
    if (_cameraRig.rotation.z < 0) _cameraRig.rotation.z += TWO_PI;
    if (_cameraRig.rotation.z > TWO_PI) _cameraRig.rotation.z -= TWO_PI;
  })
  // _cameraRig.rotation.set(0, 0, rot);

}

export function setupMap(gameTilemap: GameTilemap) {

  _gameTilemap = gameTilemap

  const gridSize = _gameTilemap.gridSize
  const gridOrigin = _gameTilemap.gridOrigin
  const tilemap = _gameTilemap.tilemap

  if (_map) {
    _scene.remove(_map)
  }

  _map = new THREE.Object3D();
  _map.position.set(0, 0, 0);

  for (let i = 0; i < tilemap.length; ++i) {
    const tileType = tilemap[i]
    const x = ((i % gridSize) + gridOrigin.x) * SIZE
    const y = (Math.floor(i / gridSize) + gridOrigin.y) * SIZE
    let mesh = null
    if (tileType == TileType.Entry) {
    } else if (tileType == TileType.Exit) {
      mesh = new THREE.Mesh(_door_geometry, _material);
      mesh.rotation.set(-HALF_PI, HALF_PI, 0)
      mesh.scale.set(0.1, 0.1, 0.1)
      loadModel('DOOR', _map, x, y)
    } else if (tileType == TileType.LockedExit) {
    } else if (tileType == TileType.Monster) {
      mesh = new THREE.Mesh(_monster_geometry, _material);
      mesh.scale.set(0.06, 0.06, 0.06)
      loadModel('MONSTER', _map, x, y)
    // } else if (tileType == TileType.SlenderDuck) {
    //   mesh = new THREE.Mesh(_slender_geometry, _material);
    //   mesh.rotateX(HALF_PI)
    //   loadModel('SLENDER_DUCK', _map, x, y)
    } else if (tileType == TileType.DarkTar) {
      mesh = new THREE.Mesh(_tar_geometry, _material);
      loadModel('DARK_TAR', _map, x, y)
    } else if (tileType == TileType.Void) {
      mesh = new THREE.Mesh(_tile_geometry, _material);
    }
    if (mesh) {
      _map.add(mesh);
      // console.log(i, x, y, tileType)
      mesh.position.set(x, y, SIZE * 0.5)
    }
  }
  
  _scene.add(_map)
}

function loadModel(modelName, parent, x, y) {
  const model = MODELS[modelName]
  // const obj = model?.object?.clone() ?? null
  console.log(`___MODEL_instance`, modelName, model)//, obj)
  // if(obj) {
  //   obj.position.set(x, y, 0)
  //   parent.add(obj);
  // }
}
