import './style.css'


import * as THREE from 'three';

import { Water } from 'three/examples/jsm/objects/Water.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Vector3 } from 'three';
// import Boat from './boat.js'

let camera, scene, renderer;
let controls, water, sun;
let aflag = 0, dflag = 0, wflag = 0, sflag = 0;
let boatToCameraVector = new Vector3(0, 50, -90);
let health = 100
let score = 0
let cameraflag = 0; // cameraflag is 0 for third person view and 1 for vird's eye view. ,, ., 

const loader = new GLTFLoader();

function random(min, max) {
  return Math.random() * (max - min) + min;
}

class Boat {
  constructor(){
    loader.load("assets/boat/scene.gltf", (gltf) => {
      scene.add( gltf.scene )
      gltf.scene.scale.set(3, 3, 3)
      gltf.scene.position.set(0,0,0)
      gltf.scene.rotation.y = Math.PI

      this.boat = gltf.scene
    }
    )}
}

class Trash{
  constructor(_scene){
    scene.add( _scene )
    _scene.scale.set(.02, .02, .02)
    _scene.position.set(random(-5000, 5000), -.5, random(-5000, 5000))
    this.trash = _scene
  }
}

let boat = new Boat()
let boatDirectonVector = new Vector3(0,0,1)


async function loadModel(url){
  return new Promise((resolve, reject) => {
    loader.load(url, (gltf) => {
      resolve(gltf.scene)
    })
  })
}

let boatModel = null
async function createTrash(){
  if(!boatModel){
    boatModel = await loadModel("assets/trash/scene.gltf")
  }
  return new Trash(boatModel.clone())
}

let trashes = []
const TRASH_COUNT = 500
let goneflag = []
init();
animate();

async function init() {
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  document.body.appendChild( renderer.domElement );

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera( 65, window.innerWidth / window.innerHeight, 1, 20000 );
  camera.position.set( 0, 50, -90 );
  camera.lookAt(0,0,50);

  sun = new THREE.Vector3();

  // Water

  const waterGeometry = new THREE.PlaneGeometry( 10000, 10000 );

  water = new Water(
    waterGeometry,
    {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load( 'assets/waternormals.jpg', function ( texture ) {

        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

      } ),
      sunDirection: new THREE.Vector3(),
      sunColor: 0xfcf795,
      waterColor: 0x001e2f,
      distortionScale: 3.7,
      fog: scene.fog !== undefined
    }
  );

  water.rotation.x = - Math.PI / 2;

  scene.add( water );

  // Skybox

  const sky = new Sky();
  sky.scale.setScalar( 10000 );
  scene.add( sky );

  const skyUniforms = sky.material.uniforms;

  skyUniforms[ 'turbidity' ].value = 10;
  skyUniforms[ 'rayleigh' ].value = 2;
  skyUniforms[ 'mieCoefficient' ].value = 0.005;
  skyUniforms[ 'mieDirectionalG' ].value = 0.8;

  const parameters = {
    elevation: 10,
    azimuth: 180
  };

  const pmremGenerator = new THREE.PMREMGenerator( renderer );

  function updateSun() {

    const phi = THREE.MathUtils.degToRad( 90 - parameters.elevation );
    const theta = THREE.MathUtils.degToRad( parameters.azimuth );

    sun.setFromSphericalCoords( 1, phi, theta );

    sky.material.uniforms[ 'sunPosition' ].value.copy( sun );
    water.material.uniforms[ 'sunDirection' ].value.copy( sun ).normalize();

    scene.environment = pmremGenerator.fromScene( sky ).texture;

  }

  updateSun();


  // controls = new OrbitControls( camera, renderer.domElement );
  // controls.maxPolarAngle = Math.PI * 0.495;
  // controls.target.set( 0, 10, 0 );
  // controls.minDistance = 40.0;
  // controls.maxDistance = 200.0;
  // controls.update();

  const waterUniforms = water.material.uniforms;

  for(let i = 0; i < TRASH_COUNT; i++){
    const trash = await createTrash()
    trashes.push(trash)
    goneflag.push(0)
  }

  window.addEventListener( 'resize', onWindowResize );

  window.addEventListener( 'keydown', function(e){
    if(e.key == "w" && boat.boat){
      // boat.boat.position.add(boatDirectonVector.clone().multiplyScalar(3))
      // camera.position.add(boatDirectonVector.clone().multiplyScalar(3))
      wflag = 1;
    }
    if(e.key == "s"){
      // boat.boat.position.add(boatDirectonVector.clone().multiplyScalar(-3))
      // camera.position.add(boatDirectonVector.clone().multiplyScalar(-3))
      sflag = 1;
    }
    if(e.key == "d"){
      // rotate the boat such that camera is looking at the boat always
      // boat.boat.rotation.y += -0.02
      // boatDirectonVector.applyAxisAngle(new Vector3(0,1,0), -0.02)
      // boatToCameraVector.applyAxisAngle(new Vector3(0,1,0), -0.02)
      // camera.position.x = boat.boat.position.x + boatToCameraVector.x
      // camera.position.y = boat.boat.position.y + boatToCameraVector.y
      // camera.position.z = boat.boat.position.z + boatToCameraVector.z
      // camera.lookAt(boat.boat.position.x + 50*boatDirectonVector.x, boat.boat.position.y + 50*boatDirectonVector.y, boat.boat.position.z + 50*boatDirectonVector.z)
      dflag = 1;
    }
    if(e.key == "a"){
      // boat.boat.rotation.y += 0.02
      // boatDirectonVector.applyAxisAngle(new Vector3(0,1,0), 0.02)
      // boatToCameraVector.applyAxisAngle(new Vector3(0,1,0), 0.02)
      // camera.position.x = boat.boat.position.x + boatToCameraVector.x
      // camera.position.y = boat.boat.position.y + boatToCameraVector.y
      // camera.position.z = boat.boat.position.z + boatToCameraVector.z
      // camera.lookAt(boat.boat.position.x + 50*boatDirectonVector.x, boat.boat.position.y + 50*boatDirectonVector.y, boat.boat.position.z + 50*boatDirectonVector.z)
      aflag = 1
    }
    if(e.key == "j"){
      if(cameraflag == 0){
        cameraflag = 1;
        camera.position.x = boat.boat.position.x
        camera.position.y = boat.boat.position.y + 400
        camera.position.z = boat.boat.position.z
        camera.lookAt(boat.boat.position.x, boat.boat.position.y, boat.boat.position.z)
      }
      else{
        cameraflag = 0;
        camera.position.x = boat.boat.position.x + boatToCameraVector.x
        camera.position.y = boat.boat.position.y + boatToCameraVector.y
        camera.position.z = boat.boat.position.z + boatToCameraVector.z
        camera.lookAt(boat.boat.position.x + 50*boatDirectonVector.x, boat.boat.position.y + 50*boatDirectonVector.y, boat.boat.position.z + 50*boatDirectonVector.z)
      }
      // set camera directly above ship
      
    }
    // camera.lookAt(boat.boat.position.x, boat.boat.position.y, boat.boat.position.z);
    // console.log(boat.boat.position)
    // console.log(camera.position)
    // console.log(boat.boat.position.clone().add(boatToCameraVector.clone()))
  })
  window.addEventListener( 'keyup', function(e){
   if(e.key == "w"){
     wflag = 0
   }
   if(e.key == "s"){
     sflag = 0
   }
   if(e.key == "d"){
     dflag = 0
   }
   if(e.key == "a"){
     aflag = 0
   }
  })
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function isColliding(obj1, obj2){
  return (
    Math.abs(obj1.position.x - obj2.position.x) < 15 &&
    Math.abs(obj1.position.z - obj2.position.z) < 15
  )
}

// function checkCollisions(){
//   if(boat.boat){
//     trashes.forEach(trash => {
//       // console.log("hello")
//       if(trash.trash){
//         if(isColliding(boat.boat, trash.trash)){
//           scene.remove(trash.trash)
          
//           score++;
//           updateHUD();
//         }
//       }
//     })
//   }
// }

function checkCollisions(){
  if(boat.boat){
    for(let i = 0; i < TRASH_COUNT; i++){
      if(isColliding(boat.boat, trashes[i].trash)){
        if(goneflag[i] == 0){
          scene.remove(trashes[i].trash)
          score++;
          goneflag[i] = 1;
          updateHUD();
        }
      }
    }
  }
}

function updateHUD(){
  document.getElementById("score").innerHTML = "Score: " + score;
  document.getElementById("health").innerHTML = "Health: " + health;
}

function animate() {
  requestAnimationFrame( animate );
  render();
  // updateHUD();
  // boat.update()
  // camera.lookAt(boat.position.x, boat.position.y, boat.position.z);
  if(wflag){
      boat.boat.position.add(boatDirectonVector.clone().multiplyScalar(3))
      camera.position.add(boatDirectonVector.clone().multiplyScalar(3))
    }
    if(sflag){
      boat.boat.position.add(boatDirectonVector.clone().multiplyScalar(-3))
      camera.position.add(boatDirectonVector.clone().multiplyScalar(-3))
    }
    if(dflag){
      // rotate the boat such that camera is looking at the boat always
      boat.boat.rotation.y += -0.02
      boatDirectonVector.applyAxisAngle(new Vector3(0,1,0), -0.02)
      boatToCameraVector.applyAxisAngle(new Vector3(0,1,0), -0.02)
      if(cameraflag == 0){
        camera.position.x = boat.boat.position.x + boatToCameraVector.x
        camera.position.y = boat.boat.position.y + boatToCameraVector.y
        camera.position.z = boat.boat.position.z + boatToCameraVector.z
        camera.lookAt(boat.boat.position.x + 50*boatDirectonVector.x, boat.boat.position.y + 50*boatDirectonVector.y, boat.boat.position.z + 50*boatDirectonVector.z)
      }
      // console.log(boat.boat.position)
      // console.log(camera.position)
      // console.log(boat.boat.position.clone().add(boatToCameraVector.clone()))
    }
    if(aflag){
      boat.boat.rotation.y += 0.02
      boatDirectonVector.applyAxisAngle(new Vector3(0,1,0), 0.02)
      boatToCameraVector.applyAxisAngle(new Vector3(0,1,0), 0.02)
      if(cameraflag == 0){
        camera.position.x = boat.boat.position.x + boatToCameraVector.x
        camera.position.y = boat.boat.position.y + boatToCameraVector.y
        camera.position.z = boat.boat.position.z + boatToCameraVector.z
        camera.lookAt(boat.boat.position.x + 50*boatDirectonVector.x, boat.boat.position.y + 50*boatDirectonVector.y, boat.boat.position.z + 50*boatDirectonVector.z)
      }
    }
  checkCollisions()
}

function render() {
  water.material.uniforms[ 'time' ].value += 1.0 / 60.0;

  renderer.render( scene, camera );

}