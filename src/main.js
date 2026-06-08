import './style.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { gsap } from 'gsap'



const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.setZ(30);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
  alpha: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
scene.add(ambientLight);

const topLight = new THREE.DirectionalLight(0xffffff, 5);
topLight.position.set(500, 500, 500);
scene.add(topLight);

let fish;
let mixer;


let swimAction;
let biteAction;
let idleAction;
let currentAction = null;

function changeAnimation(newAction) {
  if (!newAction || currentAction === newAction) return;
  
  if (currentAction) {
    currentAction.stop();
  }
  
  newAction.reset();
  newAction.play();
  
  currentAction = newAction;
}

// обрізаємо анімації(рішення погано прописаної анімації від ші)
function createAction(originalClip, name, startFrame, endFrame) {
  const cleanClip = THREE.AnimationUtils.subclip(originalClip, name, startFrame, endFrame, 30);
  return mixer.clipAction(cleanClip);
}

const loader = new GLTFLoader();
loader.load('/clown_fish_low_poly_animated.glb',
  (gltf) => {
    fish = gltf.scene;
    fish.scale.set(50, 50, 50);
    scene.add(fish);

    mixer = new THREE.AnimationMixer(fish);
    
    swimAction = createAction(gltf.animations[0], 'swim', 171, 212);
    biteAction = createAction(gltf.animations[2], 'bite', 619, 668);
    idleAction = createAction(gltf.animations[1], 'idle', 10, 170);

    swimAction.play();
    currentAction = swimAction;
  },
  (xhr) => { },
  (error) => { }
);

window.addEventListener('keydown', (event) => {
  if (event.key === '1') {
    console.log('Перемикаємо на: swim');
    changeAnimation(swimAction);
  }
  if (event.key === '2') {
    console.log('Перемикаємо на: bite');
    changeAnimation(biteAction);
  }
  if (event.key === '3') {
    console.log('Перемикаємо на: idle');
    changeAnimation(idleAction);
  }
});

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

document.addEventListener('mousemove', (event) => {
  const x = event.clientX;
  const y = event.clientY;
  
  console.log(`Cursor coordinates: X=${x}, Y=${y}`);

  moveFish(x, y)
});

const moveFish = (new_x = 0, new_y = 0, z = 0) => {
  gsap.to(fish.position, {duration: 1000, x: new_x, y: new_y, ease: "power1.out"})
}



function animate() {
  requestAnimationFrame(animate);
  if (fish) {  
    if (mixer) mixer.update(0.01);
  }
  renderer.render(scene, camera);
}

animate();