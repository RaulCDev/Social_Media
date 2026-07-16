import { useEffect } from "react";

const useWindowScroll = (contentRef: React.RefObject<HTMLDivElement>) => {
  useEffect(() => {
    const updateHeight = () => {
      const content = contentRef.current;
      if (!content) return;
      content.style.setProperty(
        "--right-rail-height",
        `${content.scrollHeight}px`,
      );
    };

    const resizeObserver = new ResizeObserver(updateHeight);
    if (contentRef.current) resizeObserver.observe(contentRef.current);
    updateHeight();

    return () => {
      resizeObserver.disconnect();
    };
  }, [contentRef]);
};

export default useWindowScroll;
