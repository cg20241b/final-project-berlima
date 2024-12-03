import { useGLTF } from '@react-three/drei';
import { GroupProps, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import {
  Group,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Vector3,
} from 'three';
import { Quaternion } from 'three';

import { updatePlaneAxis } from './control';

// Vector for controlling the plane
const x = new Vector3(1, 0, 0);
const y = new Vector3(0, 1, 0);
const z = new Vector3(0, 0, 1);

export const planePosition = new Vector3(0, 3, 7);

// This is to make the plane rotation slightly delayed
const delayedRotMatrix = new Matrix4();
const delayedQuaternion = new Quaternion();

interface Nodes {
  supports: Mesh;
  chassis: Mesh;
  helix: Mesh;
}

export function Airplane(props: GroupProps) {
  const { nodes, materials } = useGLTF(
    '/assets/models/airplane.glb',
  ) as unknown as {
    nodes: Nodes;
    materials: { [key: string]: MeshStandardMaterial };
  };
  const groupRef = useRef<Group>(null);
  const helixMeshRef = useRef<Mesh>(null);

  useFrame(({ camera }) => {
    // Uncomment this line if you want to move the plane forward
    // planePosition.add(new Vector3(0, 0, -0.005));

    updatePlaneAxis(x, y, z, planePosition, camera as PerspectiveCamera);

    const rotMatrix = new Matrix4().makeBasis(x, y, z);

    const matrix = new Matrix4()
      .multiply(
        new Matrix4().makeTranslation(
          planePosition.x,
          planePosition.y,
          planePosition.z,
        ),
      )
      .multiply(rotMatrix);

    if (groupRef.current) {
      groupRef.current.matrixAutoUpdate = false;
      groupRef.current.matrix.copy(matrix);
      groupRef.current.matrixWorldNeedsUpdate = true;
    }

    const quatA = new Quaternion().copy(delayedQuaternion);
    const quatB = new Quaternion();
    quatB.setFromRotationMatrix(rotMatrix);

    const interpolationFactor = 0.175;
    const interpolatedQuaternion = new Quaternion().copy(quatA);
    interpolatedQuaternion.slerp(quatB, interpolationFactor);
    delayedQuaternion.copy(interpolatedQuaternion);

    delayedRotMatrix.identity();
    delayedRotMatrix.makeRotationFromQuaternion(delayedQuaternion);

    const cameraMatrix = new Matrix4()
      .multiply(
        new Matrix4().makeTranslation(
          planePosition.x,
          planePosition.y,
          planePosition.z,
        ),
      )
      .multiply(delayedRotMatrix)
      // Move the camera at the center of the plane
      .multiply(new Matrix4().makeRotationX(-0.2)) // Rotate the camera slightly downward with an angle of depression
      .multiply(new Matrix4().makeTranslation(0, 0.015, 0.3)); // Move the camera at the back of the plane
    // Basically what this does is move the camera so that we have a Third Person View of the plane

    camera.matrixAutoUpdate = false;
    camera.matrix.copy(cameraMatrix);
    camera.matrixWorldNeedsUpdate = true;

    if (helixMeshRef.current) {
      helixMeshRef.current.rotation.z -= 1.0;
    }
  });

  return (
    <>
      <group ref={groupRef}>
        <group {...props} dispose={null} scale={0.01} rotation-y={Math.PI}>
          <mesh
            geometry={nodes.supports.geometry}
            material={materials['Material.004']}
          />
          <mesh
            geometry={nodes.chassis.geometry}
            material={materials['Material.005']}
          />
          <mesh
            geometry={nodes.helix.geometry}
            material={materials['Material.005']}
            ref={helixMeshRef}
          />
        </group>
      </group>
    </>
  );
}

useGLTF.preload('/assets/models/airplane.glb');
