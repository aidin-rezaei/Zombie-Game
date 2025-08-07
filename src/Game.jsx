/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import Player from './components/Player';
import Gun from './components/Gun';
import ZombieManager from './components/ZombieManager';
import GunManager from './components/GunManager';
import * as THREE from 'three';
import Walls from './components/Walls';
import Ground from './components/Ground';
import TouchControls from './components/TouchControls';

const SPAWN_AREA = { minX: -50, maxX: 50, minZ: -50, maxZ: 50 };
const MIN_DISTANCE = 1.5;
const bounds = {
  minX: -50,
  maxX: 50,
  minZ: -50,
  maxZ: 50,
};
function randomPosition() {
  const x = Math.random() * (SPAWN_AREA.maxX - SPAWN_AREA.minX) + SPAWN_AREA.minX;
  const z = Math.random() * (SPAWN_AREA.maxZ - SPAWN_AREA.minZ) + SPAWN_AREA.minZ;
  return new THREE.Vector3(x, 0, z);
}

function isFarEnough(newPos, others) {
  return others.every(pos => newPos.distanceTo(pos) >= MIN_DISTANCE);
}

export default function Game() {
  const [touchKeys, setTouchKeys] = useState({});
  const [gameKey, setGameKey] = useState(0);

  const [playerHealth, setPlayerHealth] = useState(100);
  const [damageOverlay, setDamageOverlay] = useState(false);
  const [zombies, setZombies] = useState([]);
  const zombieRefs = useRef(new Map());
  const handleTouchKeyChange = (key, isPressed) => {
    setTouchKeys(prev => ({ ...prev, [key]: isPressed }));
  };
  useEffect(() => {
    let isCancelled = false;
    const newZombies = [];

    async function spawnZombies() {
      let attempts = 0;

      for (let i = 0; i < 10; i++) {
        if (isCancelled) break;

        let pos = randomPosition();
        const positions = newZombies.map(z => z.position);

        while (!isFarEnough(pos, positions) && attempts < 1000) {
          pos = randomPosition();
          attempts++;
        }

        const newZombie = {
          id: Math.random().toString(36).substr(2, 9),
          position: pos,
          alive: true,
          hp: 2,
        };

        newZombies.push(newZombie);
        setZombies(prev => [...prev, newZombie]);

        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    setZombies([]);
    spawnZombies();

    return () => {
      isCancelled = true;
    };
  }, [gameKey]);


  useEffect(() => {
    if (playerHealth <= 0) {
      setTimeout(() => {
        alert("Game Over");
        setGameKey(prev => prev + 1);

      }, 100);
    }
  }, [playerHealth]);
  useEffect(() => {

    setTimeout(() => {


      setPlayerHealth(100);
    }, 100);

  }, [gameKey]);
  function applyPlayerDamage(amount) {
    setPlayerHealth(prev => Math.max(prev - amount, 0));
    setDamageOverlay(true);

    setTimeout(() => {
      setDamageOverlay(false);
    }, 200);
  }


  function damageZombie(id) {
    setZombies(prev =>
      prev.map(z => {
        if (z.id === id) {
          const newHp = z.hp - 1;
          return {
            ...z,
            hp: newHp <= 0 ? 0 : newHp,
            alive: newHp > 0,
          };
        }
        return z;
      })
    );
  }


  const zombieSpawnQueue = useRef(new Set());

  function handleZombieDeathComplete(id) {
    setZombies(prev => {
      return prev.filter(z => z.id !== id);
    });

    if (zombieSpawnQueue.current.has(id)) return;
    zombieSpawnQueue.current.add(id);

    setTimeout(() => {
      setZombies(prev => {
        const positions = prev.map(z => z.position);
        let newPos = randomPosition();
        let attempts = 0;

        while (!isFarEnough(newPos, positions) && attempts < 1000) {
          newPos = randomPosition();
          attempts++;
        }

        const newZombie = {
          id: Math.random().toString(36).substr(2, 9),
          position: newPos,
          alive: true,
          hp: 2,
        };

        zombieSpawnQueue.current.delete(id);

        return [...prev, newZombie];
      });
    }, 300 + Math.random() * 700);
  }


  useEffect(() => {
    zombies.forEach(z => {
      console.log(`Zombie ${z.id} position type:`, z.position.constructor.name, z.position.toArray());
    });
  }, [zombies]);

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          width: '200px',
          height: '20px',
          background: '#333',
          border: '2px solid #fff',
          zIndex: 20,
        }}
      >
        <div
          style={{
            width: `${playerHealth}%`,
            height: '100%',
            background: playerHealth > 50 ? 'green' : playerHealth > 20 ? 'orange' : 'red',
            transition: 'width 0.2s ease',
          }}
        />
      </div>
      <Canvas key={gameKey}
        shadows
        camera={{ fov: 75, position: [0, 1.6, 5], near: 0.01, far: 1000 }}
        style={{ width: "100vw", height: "100vh", position: "absolute", top: 0, left: 0 }}
      >
        <color attach="background" args={['#000']} />
        <ambientLight intensity={1} />
        <directionalLight position={[5, 10, 5]} intensity={1} castShadow />

        {/* <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#444" />
        </mesh> */}
        <Ground />
        <Walls bounds={bounds} />
        <PointerLockControls />
        <Player position={[0, 0, 0]} externalKeys={touchKeys} />
        <Gun />
        <GunManager zombies={zombies} damageZombie={damageZombie} zombieRefs={zombieRefs} />
        <ZombieManager zombies={zombies} onZombieDeathComplete={handleZombieDeathComplete} zombieRefs={zombieRefs} applyPlayerDamage={applyPlayerDamage} />
      </Canvas>

      {/* <TouchControls
        onMove={handleTouchKeyChange}
        onShoot={() => {
          const click = new MouseEvent('click', { bubbles: true });
          window.dispatchEvent(click);
        }}
      /> */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '10px',
          height: '10px',
          marginLeft: '-5px',
          marginTop: '-5px',
          backgroundColor: 'red',
          borderRadius: '50%',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      />
      {damageOverlay && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(255, 0, 0, 0.3)',
            pointerEvents: 'none',
            zIndex: 15,
          }}
        />
      )}
          <a
      href="https://github.com/yourusername" // لینک گیت هاب خودت رو اینجا بزار
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: 40,
        height: 40,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        zIndex: 1000,
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
      }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.9)'}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.6)'}
      aria-label="GitHub Repository"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        viewBox="0 0 24 24"
        fill="white"
        width="24"
        height="24"
      >
        <title>GitHub</title>
        <path d="M12 0C5.372 0 0 5.372 0 12a12 12 0 008.207 11.384c.6.112.82-.26.82-.577v-2.234c-3.338.726-4.042-1.61-4.042-1.61-.546-1.39-1.334-1.76-1.334-1.76-1.09-.745.082-.73.082-.73 1.205.084 1.838 1.24 1.838 1.24 1.07 1.834 2.807 1.304 3.49.997.108-.774.42-1.305.763-1.605-2.665-.304-5.466-1.333-5.466-5.932 0-1.31.47-2.38 1.235-3.22-.124-.303-.536-1.527.117-3.183 0 0 1.007-.322 3.3 1.23a11.51 11.51 0 013.003-.403 11.5 11.5 0 013.003.403c2.29-1.552 3.295-1.23 3.295-1.23.655 1.656.244 2.88.12 3.183.77.84 1.233 1.91 1.233 3.22 0 4.61-2.807 5.625-5.48 5.922.43.37.813 1.096.813 2.21v3.282c0 .32.217.694.825.576A12.006 12.006 0 0024 12c0-6.628-5.372-12-12-12z" />
      </svg>
    </a>
    </>
  );
}
