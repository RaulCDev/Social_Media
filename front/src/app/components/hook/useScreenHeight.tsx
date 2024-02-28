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
        console.log(window.scrollY);
        contentRef.current.style.top = '-500px';
        contentRef.current.style.removeProperty('bottom');
        contentRef.current.style.setProperty('margin-top', '1px');
      } else {
        // Up
        console.log(window.scrollY);
        contentRef.current.style.bottom = '-300px';
        contentRef.current.style.removeProperty('top');
        contentRef.current.style.setProperty('margin-top', `${currentScrollY}px`);
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