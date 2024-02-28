import { useRef, useEffect } from 'react';

const useWindowScroll = () => {
  const windowRef = useRef<Window>(null);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    windowRef.current = window;

    const handleScroll = () => {
      const currentScrollY = windowRef.current.scrollY;
      if (currentScrollY > lastScrollYRef.current) {
        console.log('El usuario está scrolleando hacia abajo');
      } else {
        console.log('El usuario está scrolleando hacia arriba');
      }
      lastScrollYRef.current = currentScrollY;
    };

    windowRef.current.addEventListener('scroll', handleScroll);

    return () => {
      windowRef.current?.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return;
};

export default useWindowScroll;