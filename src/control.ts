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

let rollVelocity = 0;
let yawVelocity = 0;
let pitchVelocity = 0;
const maxVelocity = 0.04;

let planeSpeed = 0.006;
let isPaused = false;

export let turbo = 0;

export function updatePlaneAxis(
  x: Vector3,
  y: Vector3,
  z: Vector3,
  planePosition: Vector3,
  camera: PerspectiveCamera
) {
  // Pause/Resume toggle using 'p' button
  if (controls['p']) {
    isPaused = !isPaused; // Toggle isPaused state
    controls['p'] = false; // Reset the 'p' control to avoid repeated toggling
  }

  if (isPaused) {
    return; // Skip all updates if paused
  }

  // Gradually reduce velocities
  rollVelocity *= 0.95;
  pitchVelocity *= 0.95;
  yawVelocity *= 0.95;

  if (Math.abs(rollVelocity) > maxVelocity) {
    rollVelocity = Math.sign(rollVelocity) * maxVelocity;
  }
  if (Math.abs(pitchVelocity) > maxVelocity) {
    pitchVelocity = Math.sign(pitchVelocity) * maxVelocity;
  }
  if (Math.abs(yawVelocity) > maxVelocity){
    yawVelocity = Math.sign(yawVelocity) * maxVelocity;
  }

  // Update velocities based on controls
  if (controls['q']) {
    yawVelocity += 0.0025;
  }

  if (controls['e']) {
    yawVelocity -= 0.0025;
  }

  if (controls['w']) {
    pitchVelocity -= 0.0025;
  }
  if (controls['s']) {
    pitchVelocity += 0.0025;
  }
  if (controls['a']) {
    rollVelocity += 0.0025;
  }
  if (controls['d']) {
    rollVelocity -= 0.0025;
  }

  // Reset plane orientation and position
  if (controls['r']) {
    rollVelocity = 0;
    pitchVelocity = 0;
    turbo = 0;
    x.set(1, 0, 0);
    y.set(0, 1, 0);
    z.set(0, 0, 1);
    planePosition.set(0, 3, 7);
  }

  // Update orientation
  x.applyAxisAngle(z, rollVelocity);
  y.applyAxisAngle(z, rollVelocity);

  y.applyAxisAngle(x, pitchVelocity);
  z.applyAxisAngle(x, pitchVelocity);

  x.applyAxisAngle(y, yawVelocity);
  z.applyAxisAngle(y, yawVelocity);

  x.normalize();
  y.normalize();
  z.normalize();

  // Turbo logic
  if (controls['shift']) {
    turbo += 0.025;
  } else {
    turbo -= 0.95;
  }
  turbo = Math.min(Math.max(turbo, 0), 1);

  const turboSpeed = easeOutQuad(turbo) * 0.02;

  // Update camera field of view
  camera.fov = 45 + turboSpeed * 900;
  camera.updateProjectionMatrix();

  // Update plane position
  planePosition.add(z.clone().multiplyScalar(-planeSpeed - turboSpeed));
}
