import { useRef, useEffect, useState  } from 'react';

const useWindowScroll = (contentRef: React.RefObject<HTMLDivElement>, rightMarginRef: React.RefObject<HTMLDivElement>) => {
  const [diference, setDiference] = useState(0);

  const windowRef = useRef<Window>(null);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    windowRef.current = window;

    const handleScroll = () => {
      const currentScrollY = windowRef.current.scrollY;
      if(currentScrollY > lastScrollYRef.current) {
        // Down
        if(diference < 500){
          setDiference((diference) => diference + (currentScrollY - lastScrollYRef.current));
          console.log(diference);
        }
        contentRef.current.style.top = '-500px';
        contentRef.current.style.removeProperty('bottom');
        rightMarginRef.current.style.setProperty('margin-top', '15px');
      } else {
        // Up
        contentRef.current.style.removeProperty('top');
        rightMarginRef.current.style.setProperty('margin-top', `${currentScrollY - diference}px`);
        if(diference  > 0){
          contentRef.current.style.bottom = '-500px - ';
          setDiference((diference) => diference - (currentScrollY - lastScrollYRef.current));
          console.log(diference);
        }
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