import { useEffect, useState } from 'react';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const width = window.innerWidth;

      const isTouch =
        /android|iphone|ipad|ipod|opera mini|iemobile|wpdesktop/i.test(userAgent) || width <= 768;

      setIsMobile(isTouch);
    };

    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return isMobile;
}
