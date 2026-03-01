import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.set(10, 10, 10);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

let mesh = null;

const shapeType = document.getElementById("shapeType");
const rectInputs = document.getElementById("rectInputs");
const triangleInputs = document.getElementById("triangleInputs");
const cylinderInputs = document.getElementById("cylinderInputs");


shapeType.addEventListener("change", () => {
    rectInputs.style.display = "none";
    triangleInputs.style.display = "none";
    cylinderInputs.style.display = "none";

    if (shapeType.value === "rect") rectInputs.style.display = "block";
    if (shapeType.value === "tri") triangleInputs.style.display = "block";
    if (shapeType.value === "cyl") cylinderInputs.style.display = "block";
});




function createMesh() {
    let geometry;
    let height;
    let depth;

    const alpha = parseFloat(document.getElementById("alpha").value);
    const beta = parseFloat(document.getElementById("beta").value);

    if (alpha <= 0 || alpha >= 90 || beta <= 0 || beta >= 90) {
        alert("Angles must be strictly between 1° and 89°");
        return null;
    }

    const leftAngle = (alpha * Math.PI) / 180;
    const rightAngle = (beta * Math.PI) / 180;

    if (shapeType.value === "rect") {
        const width = parseFloat(document.getElementById("width").value);
        height = parseFloat(document.getElementById("height").value);
        depth = parseFloat(document.getElementById("depthRect").value);

        if (!width || !height || !depth) return null;

        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(width, 0);
        shape.lineTo(width, height);
        shape.lineTo(0, height);
        shape.closePath();

        geometry = new THREE.ExtrudeGeometry(shape, { depth: depth, bevelEnabled: false });
    }

    if (shapeType.value === "tri") {
        const a = parseFloat(document.getElementById("sideA").value);
        const b = parseFloat(document.getElementById("sideB").value);
        const c = parseFloat(document.getElementById("sideC").value);
        depth = parseFloat(document.getElementById("depthTri").value);

        if (!a || !b || !c || !depth) return null;

        if (a + b <= c || a + c <= b || b + c <= a) {
            alert("Invalid triangle sides");
            return null;
        }

        const s = (a + b + c) / 2;
        const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));

        height = (2 * area) / a;
        const x = Math.sqrt(b * b - height * height);

        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(a, 0);
        shape.lineTo(x, height);
        shape.closePath();

        geometry = new THREE.ExtrudeGeometry(shape, { depth: depth, bevelEnabled: false });
    }

    if (shapeType.value === "cyl") {
        const radius = parseFloat(document.getElementById("radius").value);
        depth = parseFloat(document.getElementById("depthCyl").value);

        if (!radius || !depth) return null;

        height = radius * 2;

        const shape = new THREE.Shape();
        shape.absarc(0, radius, radius, 0, Math.PI * 2, false);

        geometry = new THREE.ExtrudeGeometry(shape, {
            depth: depth,
            bevelEnabled: false,
            curveSegments: 64,
        });
    }

    const pos = geometry.attributes.position;
    const maxLeftOffset = height / Math.tan(leftAngle);
    const maxRightOffset = height / Math.tan(rightAngle);

    if (maxLeftOffset + maxRightOffset > depth) {
        alert("Angles are too sharp for this depth. Geometry faces will intersect.");
        return null;
    }

    for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        const z = pos.getZ(i);
        let newZ = z;

        const leftOffset = y / Math.tan(leftAngle);
        const rightOffset = y / Math.tan(rightAngle);

        if (Math.abs(z) < 0.0001) {
            newZ = z + rightOffset;
        } else if (Math.abs(z - depth) < 0.0001) {
            newZ = z - leftOffset;
        }

        pos.setZ(i, newZ);
    }

    pos.needsUpdate = true;
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
        color: "#00BFA6",
        roughness: 0.4,
        metalness: 0.2
    });

    return new THREE.Mesh(geometry, material);
}

document.getElementById("updateBtn").addEventListener("click", () => {
    const newMesh = createMesh();
    
    // Safety check so we don't delete the old mesh if the new one fails to build...
    if (newMesh) {
        if (mesh) {
            scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
        }
        mesh = newMesh;
        scene.add(mesh);
    }
});

// Initial Scene Setup...
mesh = createMesh();
if (mesh) scene.add(mesh);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

scene.add(new THREE.AmbientLight(0xffffff, 0.4));
scene.add(new THREE.GridHelper(20, 20, 0x444444, 0x222222));
scene.add(new THREE.AxesHelper(10));

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();