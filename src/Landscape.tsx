import { MeshReflectorMaterial, useGLTF } from '@react-three/drei';
import { GroupProps } from '@react-three/fiber';
import * as React from 'react';
import { Box3, BufferGeometry, Color, Mesh, MeshStandardMaterial } from 'three';

import Airplane from './Airplane';

interface Nodes {
  landscape_gltf: { geometry: BufferGeometry };
  landscape_borders: { geometry: BufferGeometry };
  trees_light: { geometry: BufferGeometry };
  water: { geometry: BufferGeometry };
  water1: { geometry: BufferGeometry };
  water2: { geometry: BufferGeometry };
  lights: { geometry: BufferGeometry };
  Cube001: { geometry: BufferGeometry };
  Cube002: { geometry: BufferGeometry };
}

export default function Landscape(props: GroupProps) {
  const { nodes, materials } = useGLTF(
    '/assets/models/scene1.glb',
  ) as unknown as {
    nodes: Nodes;
    materials: { [key: string]: MeshStandardMaterial };
  };

  const { waterMaterial } = React.useMemo(() => {
    const lightsMaterial = new MeshStandardMaterial({
      envMapIntensity: 0,
      color: new Color('#ea6619'),
      roughness: 0,
      metalness: 0,
      emissive: new Color('#f6390f').multiplyScalar(1),
    });

    const waterMat = (
      <MeshReflectorMaterial
        transparent={true}
        opacity={0.6}
        color={'#23281b'}
        roughness={0}
        blur={[10, 10]} // Blur ground reflections (width, height), 0 skips blur
        mixBlur={1} // How much blur mixes with surface roughness (default = 1)
        mixStrength={20} // Strength of the reflections
        mixContrast={1.2} // Contrast of the reflections
        resolution={512} // Off-buffer resolution, lower=faster, higher=better quality, slower
        mirror={0} // Mirror environment, 0 = texture colors, 1 = pick up env colors
        depthScale={0} // Scale the depth factor (0 = no depth, default = 0)
        minDepthThreshold={0} // Lower edge for the depthTexture interpolation (default = 0)
        maxDepthThreshold={0.1} // Upper edge for the depthTexture interpolation (default = 0)
        depthToBlurRatioBias={0.0025} // Adds a bias factor to the depthTexture before calculating the blur amount [blurFactor = blurTexture * (depthTexture + bias)]. It accepts values between 0 and 1, default is 0.25. An amount > 0 of bias makes sure that the blurTexture is not too sharp because of the multiplication with the depthTexture
        reflectorOffset={0.0} // Offsets the virtual camera that projects the reflection. Useful when the reflective surface is some distance from the object's origin (default = 0)
      />
    );

    return { lightsMaterial, waterMaterial: waterMat };
  }, []);

  const boundingBox = React.useMemo(() => {
    const box = new Box3().setFromObject(
      new Mesh(nodes.landscape_gltf.geometry),
    );
    return box;
  }, [nodes]);

  React.useEffect(() => {
    const LandscapeMat = materials['Material.009'] as MeshStandardMaterial;
    LandscapeMat.envMapIntensity = 0.75;

    const treesMat = materials['Material.008'] as MeshStandardMaterial;
    treesMat.color = new Color('#2f2f13');
    treesMat.envMapIntensity = 0.3;
    treesMat.roughness = 1;
    treesMat.metalness = 0;
  }, [materials]);

  return (
    <>
      <group {...props} dispose={null}>
        <mesh
          geometry={nodes.landscape_gltf.geometry}
          material={materials['Material.009']}
          castShadow
          receiveShadow
        />
        <mesh
          geometry={nodes.landscape_borders.geometry}
          material={materials['Material.010']}
        />
        <mesh
          geometry={nodes.Cube001.geometry}
          material={materials['Material.003']}
          position={[-1.04, 2.766, 1.871]}
          scale={[0.22, 2.207, 0.22]}
        />
        <mesh
          geometry={nodes.Cube002.geometry}
          material={materials['Material.003']}
          position={[-0.243, 2.766, 1.293]}
          scale={[0.22, 2.207, 0.22]}
        />

        <mesh geometry={nodes.water.geometry} material={materials.Water} />
        <mesh geometry={nodes.water1.geometry} material={materials.Water} />
        <mesh geometry={nodes.water2.geometry} material={materials.Water} />
        <mesh
          geometry={nodes.lights.geometry}
          material={materials['Material.001']}
        />

        <mesh
          position={[-2.536, 1.272, 0.79]}
          rotation={[-Math.PI * 0.5, 0, 0]}
          scale={[1.285, 1.285, 1]}
        >
          <planeGeometry args={[1, 1]} />
          {waterMaterial}
        </mesh>
        <mesh
          position={[1.729, 0.943, 2.709]}
          rotation={[-Math.PI * 0.5, 0, 0]}
          scale={[3, 3, 1]}
        >
          <planeGeometry args={[1, 1]} />
          {waterMaterial}
        </mesh>
        <mesh
          position={[0.415, 1.588, -2.275]}
          rotation={[-Math.PI * 0.5, 0, 0]}
          scale={[3.105, 2.405, 1]}
        >
          <planeGeometry args={[1, 1]} />
          {waterMaterial}
        </mesh>
      </group>
      <Airplane boundingBox={boundingBox} />
    </>
  );
}

useGLTF.preload('/assets/models/scene1.glb');
