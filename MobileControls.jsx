import { useEffect, useState, useRef } from 'react';

export default function MobileControls({ onMove, onShoot, onLook }) {
  const [isMobile, setIsMobile] = useState(false);
  const touchRef = useRef(null);
  const startX = useRef(0);

  // تشخیص موبایل
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isTouch = /android|iphone|ipad|ipod|opera mini|iemobile|wpdesktop/i.test(userAgent) || window.innerWidth <= 768;
    setIsMobile(isTouch);
  }, []);

  // دراگ برای تغییر زاویه دوربین
  useEffect(() => {
    const el = touchRef.current;
    if (!el || !isMobile) return;

    const handleTouchStart = (e) => {
      startX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
      const deltaX = e.touches[0].clientX - startX.current;
      onLook(deltaX);
      startX.current = e.touches[0].clientX;
    };

    el.addEventListener('touchstart', handleTouchStart);
    el.addEventListener('touchmove', handleTouchMove);

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isMobile, onLook]);

  if (!isMobile) return null;

  return (
    <>
      <div ref={touchRef} className="absolute top-0 left-0 w-full h-full z-0" />

      {/* دکمه‌های حرکت */}
      <div className="absolute bottom-10 left-5 z-10 flex flex-col items-center gap-2">
        <button onTouchStart={() => onMove('forward')} className="bg-white rounded-full p-3">⬆️</button>
        <div className="flex gap-2">
          <button onTouchStart={() => onMove('left')} className="bg-white rounded-full p-3">⬅️</button>
          <button onTouchStart={() => onMove('right')} className="bg-white rounded-full p-3">➡️</button>
        </div>
        <button onTouchStart={() => onMove('backward')} className="bg-white rounded-full p-3">⬇️</button>
      </div>

      {/* دکمه شلیک */}
      <div className="absolute bottom-10 right-5 z-10">
        <button onTouchStart={onShoot} className="bg-red-600 text-white p-4 rounded-full">🔥</button>
      </div>
    </>
  );
}
