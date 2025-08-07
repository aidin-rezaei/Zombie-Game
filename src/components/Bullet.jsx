import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const SPEED = 3;

export default function Bullet({ position, direction, zombies, zombieRefs, damageZombie, onRemove }) {
  const ref = useRef();
  const prevPos = useRef(new THREE.Vector3());

  useEffect(() => {
    const audio = new Audio('/sounds/bullet.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => {
      console.warn("Bullet sound failed to play:", e);
    });
  }, []);

  useEffect(() => {
    if (ref.current) {
      ref.current.position.copy(position);
      prevPos.current.copy(position);
    }
  }, [position]);

  useEffect(() => {
    let animationId;

    const tick = () => {
      if (!ref.current) return;

      const currPos = ref.current.position.clone();
      const moveVec = direction.clone().multiplyScalar(SPEED);
      const nextPos = currPos.clone().add(moveVec);

      if (zombieRefs?.current) {
        for (let [id, zombieRef] of zombieRefs.current.entries()) {
          if (!zombieRef?.position) continue;

          const zombieData = zombies.find(z => z.id === id);
          if (!zombieData?.alive) continue; 

          const box = new THREE.Box3().setFromCenterAndSize(
            zombieRef.position.clone(),
            new THREE.Vector3(1.5, 2.8, 1.5)
          );

          if (intersectSegmentBox(currPos, nextPos, box)) {
            damageZombie(id);
            onRemove();
            return;
          }
        }
      }

      ref.current.position.copy(nextPos);
      prevPos.current.copy(currPos);

      if (
        Math.abs(nextPos.x) > 100 ||
        Math.abs(nextPos.y) > 100 ||
        Math.abs(nextPos.z) > 100
      ) {
        onRemove();
        return;
      }

      animationId = requestAnimationFrame(tick);
    };

    animationId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationId);
  }, [direction, zombies, zombieRefs, damageZombie, onRemove]);

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.01, 8, 8]} />
      <meshStandardMaterial color="gray" />
    </mesh>
  );
}

function intersectSegmentBox(p1, p2, box) {
  const ray = new THREE.Ray();
  const dir = new THREE.Vector3();
  dir.subVectors(p2, p1);
  const length = dir.length();
  if (length === 0) return false;
  dir.normalize();

  ray.set(p1, dir);

  const intersectPoint = new THREE.Vector3();
  const intersects = ray.intersectBox(box, intersectPoint);
  if (!intersects) return false;

  const dist = p1.distanceTo(intersectPoint);
  return dist <= length;
}
