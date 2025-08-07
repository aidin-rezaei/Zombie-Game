import React, { useEffect, useRef, useState } from 'react';

export default function TouchControls({ onMove, onShoot }) {
  const [isMobile, setIsMobile] = useState(false);
  const lastTouch = useRef(null); // فقط یک تاچ برای چرخش
  const movementThreshold = 0.1; // حساسیت حرکت

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isMobileScreen = window.innerWidth <= 768;
    setIsMobile(isTouchDevice && isMobileScreen);
  }, []);

  useEffect(() => {
    if (!isMobile) return;

    function handleTouchStart(e) {
      // فقط اولین تاچ برای چرخش
      const touch = e.touches[0];
      lastTouch.current = { x: touch.clientX, y: touch.clientY };
    }

    function handleTouchMove(e) {
      e.preventDefault();

      const touch = e.touches[0];
      if (!lastTouch.current) {
        lastTouch.current = { x: touch.clientX, y: touch.clientY };
        return;
      }

      const deltaX = touch.clientX - lastTouch.current.x;
      const deltaY = touch.clientY - lastTouch.current.y;

      if (Math.abs(deltaX) > movementThreshold || Math.abs(deltaY) > movementThreshold) {
        window.dispatchEvent(
          new MouseEvent('mousemove', {
            movementX: deltaX,
            movementY: deltaY,
            bubbles: true,
          })
        );

        lastTouch.current = { x: touch.clientX, y: touch.clientY };
      }
    }

    function handleTouchEnd(e) {
      lastTouch.current = null;
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isMobile]);

  // دکمه‌های حرکت فقط در موبایل نمایش داده شود
  if (!isMobile) return null;

  const handleTouchButton = (key, pressed) => {
    onMove(key, pressed);
  };

  return (
    <>
      {/* دکمه های حرکت */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <button
          onTouchStart={() => handleTouchButton('w', true)}
          onTouchEnd={() => handleTouchButton('w', false)}
          style={buttonStyle}
        >
          ⬆️
        </button>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onTouchStart={() => handleTouchButton('a', true)}
            onTouchEnd={() => handleTouchButton('a', false)}
            style={buttonStyle}
          >
            ⬅️
          </button>
          <button
            onTouchStart={() => handleTouchButton('s', true)}
            onTouchEnd={() => handleTouchButton('s', false)}
            style={buttonStyle}
          >
            ⬇️
          </button>
          <button
            onTouchStart={() => handleTouchButton('d', true)}
            onTouchEnd={() => handleTouchButton('d', false)}
            style={buttonStyle}
          >
            ➡️
          </button>
        </div>
      </div>

      {/* دکمه شلیک */}
      <div
        style={{
          position: 'absolute',
          bottom: 30,
          right: 30,
          zIndex: 10,
        }}
      >
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onShoot?.();
            window.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          }}
          style={{
            fontSize: 24,
            padding: '20px 25px',
            borderRadius: 10,
            background: 'red',
            color: 'white',
            border: 'none',
          }}
        >
          🔫
        </button>
      </div>
    </>
  );
}

const buttonStyle = {
  width: 60,
  height: 60,
  fontSize: 18,
  borderRadius: 10,
  backgroundColor: '#333',
  color: '#fff',
  border: '2px solid #fff',
};
