import { useFrame } from '@react-three/fiber';
import * as React from 'react';
import { BufferGeometry, Quaternion } from 'three';
import { TorusGeometry, Vector3 } from 'three';
import { mergeBufferGeometries } from 'three-stdlib';

import { planePosition } from './Airplane';

const TARGET_RAD = 0.125;

function randomPoint(scale?: Vector3) {
  return new Vector3(
    Math.random() * 2 - 1,
    Math.random() * 2 - 1,
    Math.random() * 2 - 1,
  ).multiply(scale || new Vector3(1, 1, 1));
}

type TargetType = {
  center: Vector3;
  direction: Vector3;
  hit?: boolean;
};

function initializeTargets() {
  const targets: TargetType[] = [];

  for (let i = 0; i < 25; i++) {
    targets.push({
      center: randomPoint(new Vector3(4, 1, 4)).add(
        new Vector3(0, 2 + Math.random() * 2, 0),
      ),
      direction: randomPoint().normalize(),
      hit: false,
    });
  }

  return targets;
}

export default function Targets() {
  const initialTargets = React.useMemo(() => initializeTargets(), []);
  const [targets, setTargets] = React.useState<TargetType[]>(initialTargets);

  const geometry = React.useMemo(() => {
    let geo: BufferGeometry | null = null;

    targets.forEach((target) => {
      const torusGeo = new TorusGeometry(TARGET_RAD, 0.02, 8, 25);
      torusGeo.applyQuaternion(
        new Quaternion().setFromUnitVectors(
          new Vector3(0, 0, 1),
          target.direction,
        ),
      );
      torusGeo.translate(target.center.x, target.center.y, target.center.z);

      geo = geo ? mergeBufferGeometries([geo, torusGeo]) : torusGeo;
    });

    return geo;
  }, [targets]);

  useFrame(() => {
    targets.forEach((target) => {
      const v = planePosition.clone().sub(target.center);
      const dist = target.direction.dot(v);
      const projected = planePosition
        .clone()
        .sub(target.direction.clone().multiplyScalar(dist));

      const hitDist = projected.distanceTo(target.center);

      if (hitDist < TARGET_RAD && Math.abs(dist) < 0.05) {
        target.hit = true;
      }
    });

    const atLeastOneHit = targets.find((target) => target.hit);
    if (atLeastOneHit) {
      setTargets(targets.filter((target) => !target.hit));
    }
  });

  if (!geometry) return null;

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial roughness={0.5} metalness={0.5} />
    </mesh>
  );
}
