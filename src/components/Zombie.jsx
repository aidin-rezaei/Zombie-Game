/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
import { ZombieDeath } from './ZombieDeath';

export default function Zombie({ id, position, alive, onDeathComplete, zombieRefs,applyPlayerDamage }) {
  const groupRef = useRef();
  const modelRef = useRef();
  const { camera } = useThree();
  const { scene, animations } = useGLTF('/models/zrun.glb');

  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { actions, clips } = useAnimations(animations, modelRef);

  const [isDying, setIsDying] = useState(false);
  const [isDead, setIsDead] = useState(false);

  
  useEffect(() => {
    if (groupRef.current && zombieRefs?.current) {
      zombieRefs.current.set(id, groupRef.current);
      return () => {
        zombieRefs.current.delete(id);
      };
    }
  }, [groupRef, id, zombieRefs]);

  
  useEffect(() => {
    if (!alive && !isDying && !isDead) {
      setIsDying(true);
    }
  }, [alive, isDying, isDead]);

  
  useEffect(() => {
    if (alive && clips.length > 0) {
      const walk = clips[0].name;
      if (actions[walk]) actions[walk].reset().fadeIn(0.5).play();
    }

    return () => {
      const walk = clips[0]?.name;
      if (actions[walk]) actions[walk].fadeOut(0.5);
    };
  }, [alive, clips, actions]);

  
  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.traverse(obj => {
        if (obj.isMesh) obj.frustumCulled = false;
      });
    }
  }, []);
const [lastAttackTime, setLastAttackTime] = useState(Date.now());
  
  useFrame(() => {
    if (!groupRef.current || !alive) return;

    const selfPos = groupRef.current.position;
    const target = camera.position.clone();
    target.y = 0;

    const dir = target.sub(selfPos);
    const distToPlayer = dir.length();

    const minDistance = 1.2;
    let tooClose = false;
  if (distToPlayer < 1.5) {
    const now = Date.now();
    if (now - lastAttackTime > 1000) { 
      applyPlayerDamage(1); 
      setLastAttackTime(now);
    }
  }
    if (zombieRefs?.current) {
      for (let [otherId, otherRef] of zombieRefs.current.entries()) {
        if (otherId === id || !otherRef?.position) continue;

        const otherPos = otherRef.position;
        const distance = selfPos.distanceTo(otherPos);

        if (distance < minDistance) {
          const toCamera = camera.position.clone().sub(selfPos).normalize();
          const toOther = otherPos.clone().sub(selfPos).normalize();
          const angle = toCamera.angleTo(toOther);

          if (angle < Math.PI / 4) {
            tooClose = true;
            break;
          }
        }
      }
    }

    if (distToPlayer > 1.5 && !tooClose) {
      dir.normalize();
      groupRef.current.position.x += dir.x * 0.07;
      groupRef.current.position.z += dir.z * 0.07;
    }

    groupRef.current.position.y = 0;
    groupRef.current.lookAt(new THREE.Vector3(camera.position.x, 0, camera.position.z));
  });

  
  if (isDead) return null;

if (isDying && !alive) {
  
  const deathPosition = groupRef.current ? groupRef.current.position.clone() : position;

  return (
    <ZombieDeath
      position={deathPosition}
      onDeathComplete={() => {
        setIsDead(true);
        if (onDeathComplete) onDeathComplete();
      }}
    />
  );
}

  return (
    <group ref={groupRef} position={position} scale={[0.01, 0.01, 0.01]}>
      <primitive object={clonedScene} ref={modelRef} />
    </group>
  );
}
