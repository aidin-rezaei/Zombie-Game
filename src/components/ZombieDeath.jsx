import React, { useRef, useEffect, useState } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

export function ZombieDeath({ position, onDeathComplete }) {
  const groupRef = useRef();
  const { scene, animations } = useGLTF('/models/zdeath.glb');
  const { actions, clips } = useAnimations(animations, groupRef);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!actions || clips.length === 0) return;

    const deathClip = clips[0];
    if (deathClip && actions[deathClip.name]) {
      const deathAction = actions[deathClip.name];
      deathAction.reset();
      deathAction.setLoop(THREE.LoopOnce);
      deathAction.clampWhenFinished = true;
      deathAction.fadeIn(0.2).play();

      deathAction.getMixer().addEventListener('finished', () => {
        setFinished(true);
        if (onDeathComplete) onDeathComplete();
      });
    }

    return () => {
      if (actions) {
        Object.values(actions).forEach(action => action?.fadeOut?.(0.5));
      }
    };
  }, [actions, clips, onDeathComplete]);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.traverse(child => {
        if (child.isMesh) child.frustumCulled = false;
      });
    }
  }, []);

  if (finished) return null;

  return (
    <group ref={groupRef} position={position} scale={[0.01, 0.01, 0.01]}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload('/models/zdeath.glb');
