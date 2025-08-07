import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Player({ bounds = { minX: -50, maxX: 50, minZ: -50, maxZ: 50 }, speed = 0.1, externalKeys = {} }) {
  const { camera, scene } = useThree();
  const keysPressed = useRef({});
  const raycaster = useRef(new THREE.Raycaster());
  const downVector = new THREE.Vector3(0, -1, 0);

  useEffect(() => {
    function onKeyDown(e) {
      keysPressed.current[e.code] = true;
    }
    function onKeyUp(e) {
      keysPressed.current[e.code] = false;
    }
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useFrame(() => {
    const direction = new THREE.Vector3();
    Object.assign(keysPressed.current, externalKeys);
    if (keysPressed.current['KeyW']) {
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();
      direction.add(forward);
    }
    if (keysPressed.current['KeyS']) {
      const backward = new THREE.Vector3();
      camera.getWorldDirection(backward);
      backward.y = 0;
      backward.normalize();
      direction.sub(backward);
    }
    if (keysPressed.current['KeyA']) {
      const left = new THREE.Vector3();
      camera.getWorldDirection(left);
      left.y = 0;
      left.normalize();
      left.cross(camera.up);
      direction.sub(left);
    }
    if (keysPressed.current['KeyD']) {
      const right = new THREE.Vector3();
      camera.getWorldDirection(right);
      right.y = 0;
      right.normalize();
      right.cross(camera.up);
      direction.add(right);
    }

    if (direction.lengthSq() > 0) {
      direction.normalize();
      const nextPos = camera.position.clone().add(direction.multiplyScalar(speed));


      nextPos.x = Math.min(bounds.maxX, Math.max(bounds.minX, nextPos.x));
      nextPos.z = Math.min(bounds.maxZ, Math.max(bounds.minZ, nextPos.z));


      raycaster.current.set(new THREE.Vector3(nextPos.x, 10, nextPos.z), downVector);
      const intersects = raycaster.current.intersectObjects(scene.children, true);

      if (intersects.length > 0) {

        nextPos.y = intersects[0].point.y + 1.5;
      } else {

        nextPos.y = camera.position.y;
      }

      camera.position.copy(nextPos);
    }
  });

  return null;
}
