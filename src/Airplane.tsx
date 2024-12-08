import { useGLTF } from '@react-three/drei';
import { GroupProps, useFrame } from '@react-three/fiber';
import * as React from 'react';
import {
  Box3,
  Group,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Vector3,
} from 'three';
import { Quaternion } from 'three';

import { updatePlaneAxis } from './control';

interface Nodes {
  supports: Mesh;
  chassis: Mesh;
  helix: Mesh;
  aileron1: Mesh;
  aileron2: Mesh;
  Body16: Mesh;
  wing1: Mesh;
  wing2: Mesh;
  GPS: Mesh;
  Body1001: Mesh;
  Body1002: Mesh;
  Body1003: Mesh;
  Body1004: Mesh;
  Body1005: Mesh;
  Body1006: Mesh;
  Body1007: Mesh;
  Body1008: Mesh;
}

type AirplaneProps = {
  boundingBox: Box3;
} & GroupProps;

export const planePosition = new Vector3(0, 3, 7);

// This is to make the plane rotation slightly delayed
const delayedRotMatrix = new Matrix4();
const delayedQuaternion = new Quaternion();

export default function Airplane({ boundingBox, ...props }: AirplaneProps) {
  // Vector for controlling the plane
  const x = new Vector3(1, 0, 0);
  const y = new Vector3(0, 1, 0);
  const z = new Vector3(0, 0, 1);

  const { nodes, materials } = useGLTF(
    '/assets/models/PALKONJET.glb',
  ) as unknown as {
    nodes: Nodes;
    materials: { [key: string]: MeshStandardMaterial };
  };
  const groupRef = React.useRef<Group>(null);
  const helixMeshRef = React.useRef<Mesh>(null);

  useFrame(({ camera }) => {
    const dampingFactor = 0.1;

    if (planePosition.x < boundingBox.min.x) {
      planePosition.x += (boundingBox.min.x - planePosition.x) * dampingFactor;
    }
    if (planePosition.x > boundingBox.max.x) {
      planePosition.x += (boundingBox.max.x - planePosition.x) * dampingFactor;
    }
    if (planePosition.y < boundingBox.min.y) {
      planePosition.y += (boundingBox.min.y - planePosition.y) * dampingFactor;
    }
    if (planePosition.y > boundingBox.max.y) {
      planePosition.y += (boundingBox.max.y - planePosition.y) * dampingFactor;
    }
    if (planePosition.z < boundingBox.min.z) {
      planePosition.z += (boundingBox.min.z - planePosition.z) * dampingFactor;
    }
    if (planePosition.z > boundingBox.max.z) {
      planePosition.z += (boundingBox.max.z - planePosition.z) * dampingFactor;
    }

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

    var quatA = new Quaternion().copy(delayedQuaternion);
    var quatB = new Quaternion();
    quatB.setFromRotationMatrix(rotMatrix);

    var interpolationFactor = 0.175;
    var interpolatedQuaternion = new Quaternion().copy(quatA);
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
      // .multiply(rotMatrix)
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
        <group {...props} dispose={null} scale={0.0001} rotation-y={Math.PI}>
          <group position={[0, 58.375, 350]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh
              geometry={nodes.GPS.geometry}
              material={materials.Steel}
              scale={10}
            />
          </group>
          <group position={[-39.62, 74.441, 74]} rotation={[0, 0, -Math.PI]}>
            <group position={[0, 30, -1.063]}>
              <mesh
                geometry={nodes.Body1003.geometry}
                material={materials.Steel}
                scale={10}
              />
            </group>
            <group position={[0, 20, 7.873]}>
              <mesh
                geometry={nodes.Body1004.geometry}
                material={materials.Steel}
                scale={10}
              />
            </group>
            <group
              position={[-190.059, 110.246, -243.481]}
              rotation={[-Math.PI / 2, -0.524, 0]}
            >
              <mesh
                geometry={nodes.Body1005.geometry}
                material={materials.black}
                scale={10}
              />
            </group>
            <group
              position={[-17.491, -110.581, -243.481]}
              rotation={[Math.PI / 2, -Math.PI / 6, Math.PI]}
            >
              <mesh
                geometry={nodes.Body1007.geometry}
                material={materials.black}
                scale={10}
              />
            </group>
            <group
              position={[-182.559, 97.255, -242.18]}
              rotation={[-Math.PI / 2, -0.524, 0]}
            >
              <mesh
                geometry={nodes.Body1006.geometry}
                material={materials.Steel}
                scale={10}
              />
            </group>
            <group
              position={[-9.991, -97.591, -242.18]}
              rotation={[Math.PI / 2, -Math.PI / 6, Math.PI]}
            >
              <mesh
                geometry={nodes.Body1008.geometry}
                material={materials.Steel}
                scale={10}
              />
            </group>
            <mesh
              geometry={nodes.Body1002.geometry}
              material={materials.Steel}
              scale={10}
            />
          </group>
          <group position={[-4, -65.873, -80.251]} rotation={[-1.474, 0, 0]}>
            <mesh
              geometry={nodes.Body1001.geometry}
              material={materials.black}
              scale={10}
            />
          </group>
          <mesh
            geometry={nodes.aileron1.geometry}
            material={materials.black}
            scale={10}
          />
          <mesh
            geometry={nodes.aileron2.geometry}
            material={materials.black}
            scale={10}
          />
          <mesh
            geometry={nodes.Body16.geometry}
            material={materials.silver}
            scale={10}
          />
          <mesh
            geometry={nodes.wing1.geometry}
            material={materials.blue}
            scale={10}
          />
          <mesh
            geometry={nodes.wing2.geometry}
            material={materials.blue}
            scale={10}
          />
        </group>
      </group>
    </>
  );
}

useGLTF.preload('/assets/models/PALKONJET.glb');
