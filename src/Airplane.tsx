import { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Matrix4, Vector3, Group, Mesh } from 'three';
import { updatePlaneAxis } from './control';
import { Quaternion } from 'three';

// Vector for controlling the plane
const x = new Vector3(1, 0, 0);
const y = new Vector3(0, 1, 0);
const z = new Vector3(0, 0, 1);

export const planePosition = new Vector3(0, 3, 7);

// This is to make the plane rotation slightly delayed
const delayedRotMatrix = new Matrix4();
const delayedQuaternion = new Quaternion();

export function Airplane(props: any) {
  const { nodes, materials } = useGLTF('/assets/models/airplane.glb');
  const groupRef = useRef<Group>();
  const helixMeshRef = useRef<Mesh>();

  useFrame(({ camera }) => {
    // Uncomment this line if you want to move the plane forward
    // planePosition.add(new Vector3(0, 0, -0.005));

    updatePlaneAxis(x, y, z, planePosition, camera);

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
      .multiply(delayedRotMatrix)
      // Move the camera at the center of the plane
      .multiply(new Matrix4().makeRotationX(-0.2)) // Rotate the camera slightly downward with an angle of depression
      .multiply(new Matrix4().makeTranslation(0, 0.015, 0.3)); // Move the camera at the back of the plane
    // Basically what this does is move the camera so that we have a Third Person View of the plane

    camera.matrixAutoUpdate = false;
    camera.matrix.copy(cameraMatrix);
    camera.matrixWorldNeedsUpdate = true;

    (helixMeshRef.current as any).rotation.z -= 1.0;
  });

  return (
    <>
      <group ref={groupRef as any}>
        <group {...props} dispose={null} scale={0.01} rotation-y={Math.PI}>
          <mesh
            geometry={(nodes.supports as any).geometry}
            material={materials['Material.004']}
          />
          <mesh
            geometry={(nodes.chassis as any).geometry}
            material={materials['Material.005']}
          />
          <mesh
            geometry={(nodes.helix as any).geometry}
            material={materials['Material.005']}
            ref={helixMeshRef as any}
          />
        </group>
      </group>
    </>
  );
}

useGLTF.preload('/assets/models/airplane.glb');
