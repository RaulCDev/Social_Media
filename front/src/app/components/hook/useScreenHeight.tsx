import { useRef, useEffect, useState  } from 'react';

const useWindowScroll = (contentRef: React.RefObject<HTMLDivElement>, rightMarginRef: React.RefObject<HTMLDivElement>) => {
  const [diference, setDiference] = useState(0);

  const windowRef = useRef<Window | null>(null);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    windowRef.current = window;

    const handleScroll = () => {
      const currentWindow = windowRef.current;
      const content = contentRef.current;
      const rightMargin = rightMarginRef.current;

      if (!currentWindow || !content || !rightMargin) {
        return;
      }

      const currentScrollY = currentWindow.scrollY;
      if(currentScrollY > lastScrollYRef.current) {
        // Down
        if(diference < 500){
          setDiference((diference) => diference + (currentScrollY - lastScrollYRef.current));
          console.log(diference);
        }
        content.style.top = '-500px';
        content.style.removeProperty('bottom');
        rightMargin.style.setProperty('margin-top', '15px');
      } else {
        // Up
        content.style.removeProperty('top');
        rightMargin.style.setProperty('margin-top', `${currentScrollY - diference}px`);
        if(diference  > 0){
          content.style.bottom = '-500px - ';
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
