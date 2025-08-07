import React, { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Zombie from './Zombie';

export default function ZombieManager({ zombies, onZombieDeathComplete,zombieRefs,applyPlayerDamage }) {
  const { camera, scene } = useThree();
  const soundRef = useRef();

  


  useEffect(() => {
    const listener = new THREE.AudioListener();
    camera.add(listener);

    const sound = new THREE.Audio(listener);
    soundRef.current = sound;

    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('/sounds/zombies.mp3', buffer => {
      sound.setBuffer(buffer);
      sound.setLoop(true);
      sound.setVolume(0.5);
      sound.play();
    });

    scene.add(sound);

    return () => {
      sound.stop();
      camera.remove(listener);
    };
  }, [camera, scene]);

  return (
    <>
      {zombies.map(z => (
        <Zombie
          key={z.id}
          id={z.id}
          position={z.position}
          alive={z.alive}
          onDeathComplete={() => onZombieDeathComplete(z.id)}
          zombieRefs={zombieRefs} 
          applyPlayerDamage={applyPlayerDamage}
        />
      ))}
    </>
  );
}
