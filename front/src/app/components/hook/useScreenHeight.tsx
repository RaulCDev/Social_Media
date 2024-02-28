import { useRef, useEffect } from 'react';

const useWindowScroll = (contentRef: React.RefObject<HTMLDivElement>) => {
  const windowRef = useRef<Window>(null);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    windowRef.current = window;

    const handleScroll = () => {
      const currentScrollY = windowRef.current.scrollY;
      if (currentScrollY > lastScrollYRef.current) {
        // Down
        contentRef.current.style.top = '-500px';
        contentRef.current.style.bottom = '0px';
      } else {
        // Up
        contentRef.current.style.top = '0px';
        contentRef.current.style.bottom = '-500px';
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