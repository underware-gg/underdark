


import * as THREE from 'three';

//@ts-ignore
import Stats from 'three/addons/libs/stats.module.js'
//@ts-ignore
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
//@ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

import { DepthPostShader } from './DepthPostShader'
import { TileType } from '../utils/underdark';

//
// Depth render based on:
// https://threejs.org/examples/#webgl_depth_texture
// https://github.com/mrdoob/three.js/blob/master/examples/webgl_depth_texture.html
//

const SIZE = 1;
const CAM_FOV = 70;
const CAM_FAR = 10;

let _width: number;
let _height: number;
let _aspect: number;
let _eyeZ: number;

let _renderer: THREE.WebGLRenderer;
let _camera: THREE.PerspectiveCamera;
let _scene: THREE.Scene
let _map: THREE.Object3D;
let _controls, _stats;
let _target, _postScene, _postCamera, _postMaterial;
let _supportsExtension: boolean = true;

let _tile_geometry: THREE.BoxGeometry;
let _tile_material: THREE.Material;

const params = {
  fov: CAM_FOV,
  far: CAM_FAR,
};


//-------------------------------------------
// Setup
//

export function init(canvas, width, height) {

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

  _camera = new THREE.PerspectiveCamera(
    CAM_FOV,  // fov
    _aspect,  // aspect
    0.01,     // near
    CAM_FAR,  // far
  );
  _camera.position.set(0, 0, _eyeZ);
  _camera.lookAt(0, 10, _eyeZ);

  // _controls = new OrbitControls(camera, renderer.domElement);
  // _controls.enableDamping = true;

  setupRenderTarget();
  setupScene();
  setupPost();

  onWindowResize();
  window.addEventListener('resize', onWindowResize);

  const gui = new GUI({ width: 300 });
  gui.add(params, 'fov', 45, 90, 1).onChange(guiUpdatedCamera);
  gui.add(params, 'far', 1, 20, 0.1).onChange(guiUpdatedCamera);
  gui.open();

  _stats = new Stats();
  document.body.appendChild(_stats.dom);
}

function guiUpdatedCamera() {
  _camera.fov = params.fov;
  _camera.far = params.far;
  _camera.updateProjectionMatrix();
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
  _postCamera = new THREE.OrthographicCamera(- 1, 1, 1, - 1, 0, 1);
  _postMaterial = new THREE.ShaderMaterial({
    vertexShader: DepthPostShader.vertexShader,
    fragmentShader: DepthPostShader.fragmentShader,
    uniforms: {
      cameraNear: { value: _camera.near },
      cameraFar: { value: _camera.far },
      tDiffuse: { value: null },
      tDepth: { value: null }
    }
  });
  const postPlane = new THREE.PlaneGeometry(2, 2);
  const postQuad = new THREE.Mesh(postPlane, _postMaterial);
  _postScene = new THREE.Scene();
  _postScene.add(postQuad);
}

function onWindowResize() {
  // const aspect = window.innerWidth / window.innerHeight;
  // camera.aspect = aspect;
  // camera.updateProjectionMatrix();
  // const dpr = renderer.getPixelRatio();
  // target.setSize(window.innerWidth * dpr, window.innerHeight * dpr);
  // renderer.setSize(window.innerWidth, window.innerHeight);
}

function makeTorus(scene) {
  const geometry = new THREE.TorusKnotGeometry(1, 0.3, 128, 64);
  const material = new THREE.MeshBasicMaterial({ color: 'blue' });
  const count = 50;
  const scale = 5;
  for (let i = 0; i < count; i++) {
    const r = Math.random() * 2.0 * Math.PI;
    const z = (Math.random() * 2.0) - 1.0;
    const zScale = Math.sqrt(1.0 - z * z) * scale;
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      Math.cos(r) * zScale,
      Math.sin(r) * zScale,
      z * scale
    );
    mesh.rotation.set(Math.random(), Math.random(), Math.random());
    scene.add(mesh);
  }
}


//-------------------------------------------
// Game Loop
//

export function animate() {
  if (!_supportsExtension) return;

  requestAnimationFrame(animate);

  // render scene into target
  _renderer.setRenderTarget(_target);
  _renderer.render(_scene, _camera);

  // render post FX
  _postMaterial.uniforms.tDiffuse.value = _target.texture;
  _postMaterial.uniforms.tDepth.value = _target.depthTexture;

  _renderer.setRenderTarget(null);
  _renderer.render(_postScene, _postCamera);

  // _controls.update(); // required because damping is enabled

  _stats.update();
}


//-------------------------------------------
// Scene
//

function setupScene() {

  _scene = new THREE.Scene();

  _tile_geometry = new THREE.BoxGeometry(SIZE, SIZE, SIZE);
  _tile_material = new THREE.MeshBasicMaterial({ color: 'blue' });

  const floor_geometry = new THREE.PlaneGeometry(40 * SIZE, 40 * SIZE);
  const floor_material = new THREE.MeshBasicMaterial({ color: 'cyan' });
  const floor = new THREE.Mesh(floor_geometry, floor_material);
  floor.position.set(0,0,0);
  const ceiling = new THREE.Mesh(floor_geometry, floor_material);
  ceiling.position.set(0, 0, SIZE);
  ceiling.scale.set(1,1,-1);

  _scene.add(floor);
  _scene.add(ceiling);

  // makeTorus(_scene);
}

export function setupMap(tilemap: number[]) {

  const gridSize = Math.sqrt(tilemap.length)

  if (_map) {
    _scene.remove(_map)
  }

  _map = new THREE.Object3D();
  _map.position.set(- (gridSize * SIZE) / 2, - (gridSize * SIZE) / 2, 0);

  const result: any = []
  for (let i = 0; i < tilemap.length; ++i) {
    const key = `tile_${i}`
    const tileType = tilemap[i]
    const x = (i % gridSize) * SIZE
    const y = Math.floor(i / gridSize) * SIZE
    let mesh = null
    if (tileType == TileType.Path) {
    } else if (tileType == TileType.Entry) {
    } else if (tileType == TileType.Exit) {
    } else if (tileType == TileType.LockedExit) {
    } else {
      mesh = new THREE.Mesh(_tile_geometry, _tile_material);
    }
    if (mesh) {
      mesh.position.set(x, y, SIZE / 2)
      _map.add(mesh);
    }
  }

  _scene.add(_map)

}
