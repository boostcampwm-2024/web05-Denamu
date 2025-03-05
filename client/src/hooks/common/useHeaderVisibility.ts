import { useEffect, useState, useCallback } from "react";

export const useHeaderVisibility = (rootElement: Element | null) => {
  const [headerElement, setHeaderElement] = useState<HTMLDivElement | null>(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const headerRef = useCallback((node: HTMLDivElement | null) => {
    if (node !== null) {
      setHeaderElement(node);
    }
  }, []);

  useEffect(() => {
    if (!rootElement || !headerElement) return;

    const observer = new IntersectionObserver(([entry]) => setIsHeaderVisible(entry.isIntersecting), {
      root: rootElement,
      threshold: 1.0,
    });

    observer.observe(headerElement);

    return () => observer.disconnect();
  }, [rootElement, headerElement]);

  return { headerRef, isHeaderVisible };
};
