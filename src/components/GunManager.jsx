import React, { useState, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import Bullet from './Bullet';
import * as THREE from 'three';

export default function GunManager({ zombies, damageZombie, zombieRefs }) {
    const { camera } = useThree();
    const [bullets, setBullets] = useState([]);
    const canShoot = useRef(true);

    const handleShoot = () => {
        if (!canShoot.current) return;

        
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        console.log('Shoot direction:', direction.toArray());

        
        const position = camera.position.clone().add(direction.clone().multiplyScalar(0.5));

        setBullets(prev => [
            ...prev,
            {
                id: Math.random(),
                position: position.clone(), 
                direction: direction.clone(),
            },
        ]);

        canShoot.current = false;
        setTimeout(() => {
            canShoot.current = true;
        }, 300); 
    };

    const removeBullet = (id) => {
        setBullets(prev => prev.filter(b => b.id !== id));
    };

    return (
        <>
            {/* ثبت کلیک برای شلیک */}
            <ClickToShoot onShoot={handleShoot} />

            {/* رندر گلوله‌ها */}
            {bullets.map(bullet => (
                <Bullet
                    key={bullet.id}
                    position={bullet.position}
                    direction={bullet.direction}
                    onRemove={() => removeBullet(bullet.id)}
                    zombies={zombies}
                    zombieRefs={zombieRefs}
                    damageZombie={damageZombie}
                />
            ))}
        </>
    );
}

function ClickToShoot({ onShoot }) {
    React.useEffect(() => {
        const handleClick = () => {
            onShoot();
        };

        window.addEventListener('click', handleClick);
        return () => {
            window.removeEventListener('click', handleClick);
        };
    }, [onShoot]);

    return null;
}
