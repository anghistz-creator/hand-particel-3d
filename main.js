import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 1000);
camera.position.z = 8;

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("three-canvas"),
  alpha: true,
  antialias: true
});
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

const geometry = new THREE.BufferGeometry();
const COUNT = 2500;
const positions = new Float32Array(COUNT * 3);

for (let i = 0; i < COUNT * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 6;
}
geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

const material = new THREE.PointsMaterial({
  size: 0.05,
  color: 0xff00ff
});

const particles = new THREE.Points(geometry, material);
scene.add(particles);

function animate() {
  requestAnimationFrame(animate);
  particles.rotation.y += 0.001;
  particles.rotation.x += 0.0007;
  renderer.render(scene, camera);
}
animate();

/* ===== SHAPES ===== */
function setShape(type) {
  const arr = geometry.attributes.position.array;

  for (let i = 0; i < COUNT; i++) {
    let x = 0, y = 0, z = 0;

    if (type === "heart") {
      const t = Math.random() * Math.PI * 2;
      x = 0.16 * Math.pow(Math.sin(t), 3) * 10;
      y = (0.13 * Math.cos(t) - 0.05 * Math.cos(2*t)) * 10;
    }

    if (type === "flower") {
      const a = Math.random() * Math.PI * 2;
      const r = 2 + Math.sin(5 * a) * 0.7;
      x = Math.cos(a) * r;
      y = Math.sin(a) * r;
    }

    if (type === "saturn") {
      const a = Math.random() * Math.PI * 2;
      const r = 2.5;
      x = Math.cos(a) * r;
      z = Math.sin(a) * r;
    }

    if (type === "fireworks") {
      const a = Math.random() * Math.PI * 2;
      const b = Math.random() * Math.PI;
      const r = Math.random() * 3;
      x = Math.cos(a) * Math.sin(b) * r;
      y = Math.sin(a) * Math.sin(b) * r;
      z = Math.cos(b) * r;
    }

    if (type === "star") {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() > 0.5 ? 3 : 1.5;
      x = Math.cos(a) * r;
      y = Math.sin(a) * r;
    }

    arr[i * 3] = x;
    arr[i * 3 + 1] = y;
    arr[i * 3 + 2] = z;
  }

  geometry.attributes.position.needsUpdate = true;
}

document.querySelectorAll("#ui button").forEach(btn => {
  btn.onclick = () => setShape(btn.dataset.shape);
});

/* ===== HAND TRACKING ===== */
const video = document.getElementById("video");

const hands = new Hands({
  locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.6,
  minTrackingConfidence: 0.6
});

hands.onResults(res => {
  if (!res.multiHandLandmarks[0]) return;

  const h = res.multiHandLandmarks[0];
  const thumb = h[4];
  const index = h[8];

  const dist = Math.hypot(thumb.x - index.x, thumb.y - index.y);

  particles.scale.setScalar(1 + dist * 4);
  material.color.setHSL(dist, 1, 0.5);
});

const cam = new Camera(video, {
  onFrame: async () => await hands.send({ image: video }),
  width: 640,
  height: 480
});
cam.start();

/* ===== MUSIC (iOS autoplay fix) ===== */
const audio = document.getElementById("bgm");
document.body.addEventListener("click", () => audio.play(), { once: true });

window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});