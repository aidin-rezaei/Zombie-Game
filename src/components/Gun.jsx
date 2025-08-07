/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export default function Gun({ url = '/models/gun.glb' }) {
  const { scene } = useGLTF(url);
  const groupRef = useRef();
  const gunRef = useRef();
  const { camera, scene: mainScene } = useThree();
  const [recoil, setRecoil] = useState(false);
  const recoilTimer = useRef(0);

  
  const triggerRecoil = () => {
    setRecoil(true);
    recoilTimer.current = 0;
  };

  
  useEffect(() => {
    const handleShoot = () => {
      triggerRecoil();
    };

    window.addEventListener('mousedown', handleShoot);
    return () => window.removeEventListener('mousedown', handleShoot);
  }, []);

  useEffect(() => {
    if (groupRef.current) {
      camera.add(groupRef.current);
      mainScene.add(camera);
      groupRef.current.position.set(0.3, -0.3, -0.7);
      groupRef.current.rotation.set(0, 0, 0);
      groupRef.current.scale.set(1, 1, 1);
    }

    return () => {
      if (groupRef.current) camera.remove(groupRef.current);
    };
  }, [camera, mainScene]);

  useEffect(() => {
    if (gunRef.current) {
      gunRef.current.rotation.set(0, Math.PI / 2, 0);

      gunRef.current.traverse(child => {
        if (child.isMesh) {
          child.frustumCulled = false;
          child.castShadow = true;
        }
      });
    }
  }, []);

  
  useFrame((_, delta) => {
    if (groupRef.current && recoil) {
      recoilTimer.current += delta;

      if (recoilTimer.current < 0.1) {
        
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0.2, 0.3);
      } else {
        
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.2);

        if (Math.abs(groupRef.current.rotation.x) < 0.01) {
          groupRef.current.rotation.x = 0;
          setRecoil(false);
        }
      }
    }
  });

  return (
    <group ref={groupRef}>
      <primitive
        ref={gunRef}
        object={scene}
        scale={0.14}
        position={[0, 0, 0]}
      />
    </group>
  );
}
