import { PerspectiveCamera, Vector3 } from 'three';

export const controls: { [key: string]: boolean } = {};

function easeOutQuad(x: number) {
  return 1 - (1 - x) * (1 - x);
}

window.addEventListener('keydown', (e) => {
  controls[e.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (e) => {
  controls[e.key.toLowerCase()] = false;
});

let yawVelocity = 0;
let pitchVelocity = 0;
const maxVelocity = 0.04;

// let rollVelocity = 0;
const planeSpeed = 0.006;

export let turbo = 0;
export function updatePlaneAxis(
  x: Vector3,
  y: Vector3,
  z: Vector3,
  planePosition: Vector3,
  camera: PerspectiveCamera,
) {
  yawVelocity *= 0.95;
  pitchVelocity *= 0.95;

  if (Math.abs(yawVelocity) > maxVelocity) {
    yawVelocity = Math.sign(yawVelocity) * maxVelocity;
  }
  if (Math.abs(pitchVelocity) > maxVelocity) {
    pitchVelocity = Math.sign(pitchVelocity) * maxVelocity;
  }

  if (controls['w']) {
    pitchVelocity -= 0.0025;
  }
  if (controls['s']) {
    pitchVelocity += 0.0025;
  }
  if (controls['a']) {
    yawVelocity += 0.0025;
  }
  if (controls['d']) {
    yawVelocity -= 0.0025;
  }

  if (controls['r']) {
    yawVelocity = 0;
    pitchVelocity = 0;
    turbo = 0;
    x.set(1, 0, 0);
    y.set(0, 1, 0);
    z.set(0, 0, 1);
    planePosition.set(0, 3, 7);
  }

  x.applyAxisAngle(z, yawVelocity);
  y.applyAxisAngle(z, yawVelocity);

  y.applyAxisAngle(x, pitchVelocity);
  z.applyAxisAngle(x, pitchVelocity);

  x.normalize();
  y.normalize();
  z.normalize();

  if (controls.shift) {
    turbo += 0.025;
  } else {
    turbo -= 0.95;
  }
  turbo = Math.min(Math.max(turbo, 0), 1);

  const turboSpeed = easeOutQuad(turbo) * 0.02;

  camera.fov = 45 + turboSpeed * 900;
  camera.updateProjectionMatrix();

  planePosition.add(z.clone().multiplyScalar(-planeSpeed - turboSpeed));
}
