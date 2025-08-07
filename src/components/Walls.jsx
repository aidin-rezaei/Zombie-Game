import React from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';

export default function Walls({ bounds }) {
  const [diffuseMap, displacementMap] = useLoader(THREE.TextureLoader, [
    '/textures/rock_wall_12_diff_4k.jpg',
    '/textures/rock_wall_12_disp_4k.png',
  ]);

  
  diffuseMap.wrapS = diffuseMap.wrapT = THREE.RepeatWrapping;
  displacementMap.wrapS = displacementMap.wrapT = THREE.RepeatWrapping;
  diffuseMap.repeat.set(4, 1);
  displacementMap.repeat.set(4, 1);

  const wallThickness = 1;
  const wallHeight = 5;

  const width = bounds.maxX - bounds.minX;
  const depth = bounds.maxZ - bounds.minZ;

  const materialProps = {
    map: diffuseMap,
    displacementMap,
    displacementScale: 0.2,
    roughness: 1,
    metalness: 0,
  };

  return (
    <>
      {/* Front Wall */}
      <mesh position={[0, wallHeight / 2, bounds.minZ - wallThickness / 2]} receiveShadow castShadow>
        <boxGeometry args={[width + wallThickness * 2, wallHeight, wallThickness]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, wallHeight / 2, bounds.maxZ + wallThickness / 2]} receiveShadow castShadow>
        <boxGeometry args={[width + wallThickness * 2, wallHeight, wallThickness]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* Left Wall */}
      <mesh position={[bounds.minX - wallThickness / 2, wallHeight / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[wallThickness, wallHeight, depth + wallThickness * 2]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* Right Wall */}
      <mesh position={[bounds.maxX + wallThickness / 2, wallHeight / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[wallThickness, wallHeight, depth + wallThickness * 2]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>
    </>
  );
}