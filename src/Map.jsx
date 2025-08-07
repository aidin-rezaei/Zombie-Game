// import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';

export default function Map({ url = '/models/gas-station.glb' }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1} position={[0, 0, 0]} />;
}
Map.displayName = 'Map';
useGLTF.preload('/models/gas-station.glb');