// import * as THREE from 'three';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// const loader = new GLTFLoader();

export default class Boat {
    constructor(){
      loader.load("assets/boat/scene.gltf", (gltf) => {
        scene.add( gltf.scene )
        gltf.scene.scale.set(3, 3, 3)
        gltf.scene.position.set(5,-1,50)
        gltf.scene.rotation.y = Math.PI
  
        this.boat = gltf.scene
        this.speed = {
          vel: 0,
          rot: 0
        }
      })
    }
  
    stop(){
      this.speed.vel = 0
      this.speed.rot = 0
    }
  
    update(){
      if(this.boat){
        this.boat.rotation.y += this.speed.rot
        this.boat.position.z += this.speed.vel
      }
    }
  }