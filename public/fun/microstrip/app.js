import * as THREE from "three";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/controls/OrbitControls.js";

const form = document.getElementById("design-form");
const viewer = document.getElementById("viewer");
const outW = document.getElementById("result-w");
const outWH = document.getElementById("result-wh");
const outEff = document.getElementById("result-eeff");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe8f3ff);

const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 5000);
camera.position.set(120, 90, 120);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
viewer.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

scene.add(new THREE.HemisphereLight(0xffffff, 0x5c6b73, 1.1));
const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
dirLight.position.set(70, 120, 90);
scene.add(dirLight);

const grid = new THREE.GridHelper(250, 25, 0x6f8ba6, 0xbfd7ea);
scene.add(grid);

let modelGroup = new THREE.Group();
scene.add(modelGroup);

function effectivePermittivity(er, u) {
  const base = (er + 1) / 2 + ((er - 1) / 2) * (1 / Math.sqrt(1 + 12 / u));
  if (u < 1) {
    return base + 0.04 * Math.pow(1 - u, 2);
  }
  return base;
}

function z0FromU(u, er) {
  const eeff = effectivePermittivity(er, u);
  if (u <= 1) {
    return (60 / Math.sqrt(eeff)) * Math.log(8 / u + u / 4);
  }
  return (120 * Math.PI) / (Math.sqrt(eeff) * (u + 1.393 + 0.667 * Math.log(u + 1.444)));
}

function ellipticK(k) {
  const kc = Math.min(Math.max(k, 1e-6), 0.999999);
  let a = 1;
  let b = Math.sqrt(1 - kc * kc);
  for (let i = 0; i < 30; i += 1) {
    const nextA = (a + b) / 2;
    const nextB = Math.sqrt(a * b);
    a = nextA;
    b = nextB;
    if (Math.abs(a - b) < 1e-12) {
      break;
    }
  }
  return Math.PI / (2 * a);
}

function z0CoplanarApproxFromU(u, er, gapOverH) {
  const k = u / (u + 2 * gapOverH);
  const kp = Math.sqrt(1 - k * k);
  const kRatio = ellipticK(kp) / ellipticK(k);
  const eeffCpw = (er + 1) / 2 + ((er - 1) / 2) * (1 / Math.sqrt(1 + 12 / (u + 2 * gapOverH)));
  return {
    z0: (30 * Math.PI * kRatio) / Math.sqrt(eeffCpw),
    eeff: eeffCpw,
  };
}

function combinedLineModel(u, er, gapOverH, addLeftGnd, addRightGnd) {
  const microEeff = effectivePermittivity(er, u);
  const microZ0 = z0FromU(u, er);
  const gndCount = (addLeftGnd ? 1 : 0) + (addRightGnd ? 1 : 0);

  if (gndCount === 0) {
    return { z0: microZ0, eeff: microEeff };
  }

  // Include side grounds with a coplanar-with-ground approximation.
  const cpw = z0CoplanarApproxFromU(u, er, gapOverH);
  const blend = gndCount === 2 ? 1.0 : 0.55;
  return {
    z0: microZ0 + (cpw.z0 - microZ0) * blend,
    eeff: microEeff + (cpw.eeff - microEeff) * blend,
  };
}

function solveUForImpedance(targetZ0, er, gapOverH, addLeftGnd, addRightGnd) {
  let lo = 0.01;
  let hi = 50;
  for (let i = 0; i < 100; i += 1) {
    const mid = (lo + hi) / 2;
    const zMid = combinedLineModel(mid, er, gapOverH, addLeftGnd, addRightGnd).z0;
    if (zMid > targetZ0) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return (lo + hi) / 2;
}

function clearGroup(group) {
  while (group.children.length > 0) {
    const obj = group.children.pop();
    if (obj.geometry) {
      obj.geometry.dispose();
    }
    if (obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach((m) => m.dispose());
      } else {
        obj.material.dispose();
      }
    }
  }
}

function buildModel(width, h, t, length, gap, addLeftGnd, addRightGnd) {
  clearGroup(modelGroup);

  const neededTopWidth =
    width +
    (addLeftGnd ? width + gap : 0) +
    (addRightGnd ? width + gap : 0);
  const boardWidth = Math.max(neededTopWidth * 1.2, width * 6, h * 10);
  const boardLength = Math.max(length, width * 8);
  const baseY = h / 2;

  const substrate = new THREE.Mesh(
    new THREE.BoxGeometry(boardWidth, h, boardLength),
    new THREE.MeshStandardMaterial({
      color: 0x3cb179,
      transparent: true,
      opacity: 0.86,
      roughness: 0.5,
      metalness: 0.06,
    })
  );
  substrate.position.y = baseY;
  modelGroup.add(substrate);

  const trace = new THREE.Mesh(
    new THREE.BoxGeometry(width, t, boardLength * 0.9),
    new THREE.MeshStandardMaterial({ color: 0xcc7a00, metalness: 0.72, roughness: 0.24 })
  );
  trace.position.y = h + t / 2;
  modelGroup.add(trace);

  const sideGndMaterial = new THREE.MeshStandardMaterial({
    color: 0x8c8c8c,
    metalness: 0.82,
    roughness: 0.28,
  });

  const sideGndGeometry = new THREE.BoxGeometry(width, t, boardLength * 0.9);
  const centerOffset = width + gap;

  if (addLeftGnd) {
    const leftGnd = new THREE.Mesh(sideGndGeometry, sideGndMaterial);
    leftGnd.position.set(-centerOffset, h + t / 2, 0);
    modelGroup.add(leftGnd);
  }

  if (addRightGnd) {
    const rightGnd = new THREE.Mesh(sideGndGeometry, sideGndMaterial);
    rightGnd.position.set(centerOffset, h + t / 2, 0);
    modelGroup.add(rightGnd);
  }

  const ground = new THREE.Mesh(
    new THREE.BoxGeometry(boardWidth, t, boardLength),
    new THREE.MeshStandardMaterial({ color: 0x9a9a9a, metalness: 0.8, roughness: 0.3 })
  );
  ground.position.y = -t / 2;
  modelGroup.add(ground);

  const maxDim = Math.max(boardWidth, boardLength, h * 30);
  camera.position.set(maxDim * 0.8, maxDim * 0.55, maxDim * 0.8);
  controls.target.set(0, h / 2, 0);
  controls.update();
}

function updateDesign() {
  const z0 = Number(document.getElementById("z0").value);
  const h = Number(document.getElementById("h").value);
  const er = Number(document.getElementById("er").value);
  const length = Number(document.getElementById("length").value);
  const t = Number(document.getElementById("t").value);
  const gap = Number(document.getElementById("gnd-gap").value);
  const addLeftGnd = document.getElementById("gnd-left").checked;
  const addRightGnd = document.getElementById("gnd-right").checked;

  if ([z0, h, er, length, t, gap].some((n) => !Number.isFinite(n) || n <= 0)) {
    return;
  }

  const gapOverH = gap / h;
  const u = solveUForImpedance(z0, er, gapOverH, addLeftGnd, addRightGnd);
  const width = u * h;
  const eeff = combinedLineModel(u, er, gapOverH, addLeftGnd, addRightGnd).eeff;

  outW.textContent = `${width.toFixed(3)} mm`;
  outWH.textContent = u.toFixed(3);
  outEff.textContent = eeff.toFixed(3);

  buildModel(width, h, t, length, gap, addLeftGnd, addRightGnd);
}

function resizeRenderer() {
  const { clientWidth, clientHeight } = viewer;
  renderer.setSize(clientWidth, clientHeight);
  camera.aspect = clientWidth / clientHeight;
  camera.updateProjectionMatrix();
}

window.addEventListener("resize", resizeRenderer);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  updateDesign();
});
form.addEventListener("input", updateDesign);

resizeRenderer();
updateDesign();

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();
