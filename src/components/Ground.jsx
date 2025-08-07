import React from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';

export default function Ground() {
  const [diffuseMap, displacementMap] = useLoader(THREE.TextureLoader, [
    '/textures/asphalt_pit_lane_diff_4k.jpg',
    
  ]);

  
  diffuseMap.wrapS = diffuseMap.wrapT = THREE.RepeatWrapping;


  const repeatX = 20;
  const repeatY = 20;

  diffuseMap.repeat.set(repeatX, repeatY);


  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[100, 100, 256, 256]} />
      <meshStandardMaterial
        map={diffuseMap}
        displacementMap={displacementMap}
        displacementScale={0.3}
        roughness={1}
        metalness={0}
      />
    </mesh>
  );
}
