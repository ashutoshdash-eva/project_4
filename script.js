import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// camera.position.set(10,10,10);
camera.position.set(-10,10,6);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

const shape = new THREE.Shape();
// shape.absarc(0,0,1.5,0,2*Math.PI,false);
shape.moveTo(0,0);
shape.lineTo(4,0);
shape.lineTo(4,4);
shape.lineTo(0,4);
shape.closePath();

const geometry = new THREE.ExtrudeGeometry(shape,{
    depth:5,
    bevelEnabled:false
})


const leftAngle = 15 * Math.PI/180;
const rightAngle = 30 * Math.PI/180;

// geometry.center();

// const geometry = new THREE.BoxGeometry(4,4,4);

// Custom vertex manipulation

// const pos = geometry.attributes.position;

// const angle = 45*(Math.PI/180);
// // const slope = Math.tan(angle);
// let offset;
// for (let i=0;i<pos.count;i++){
//     let x = pos.getX(i);
//     let y = pos.getY(i);
//     let z = pos.getZ(i);

//     offset = y * Math.tan(angle);
//     z = x + offset;

//     pos.setX(i,z);

// }

const pos = geometry.attributes.position;

for (let i = 0; i<pos.count; i++){
    const y = pos.getY(i);
    const z = pos.getZ(i);
    
    let newZ = z;

    if (z==0){
        newZ = z + y * Math.tan(leftAngle);
    }
    else if(z==5){
        newZ = z - y * Math.tan(rightAngle);
    }

    pos.setZ(i,newZ);
}

pos.needsUpdate = true;
// geometry.computeVertexNormals();

const mesh = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());

scene.add(mesh);

const axesHelper = new THREE.AxesHelper(15);
scene.add(axesHelper);

const size = 20;
const divisions = 20;
const gridHelper = new THREE.GridHelper( size, divisions );
scene.add( gridHelper );


// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);
const amblight = new THREE.AmbientLight(0xffffff,0.5)
scene.add(amblight);

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();

console.log(geometry.attributes.position);