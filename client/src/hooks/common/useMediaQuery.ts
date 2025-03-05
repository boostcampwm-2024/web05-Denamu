import { useState, useEffect } from "react";

export const useMediaQuery = (query: string): boolean => {
  const [viewport, setViewport] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setViewport(mediaQuery.matches);
    const eventListener = (e: MediaQueryListEvent) => {
      setViewport(e.matches);
    };
    mediaQuery.addEventListener("change", eventListener);

    return () => {
      mediaQuery.removeEventListener("change", eventListener);
    };
  }, [query]);

  return viewport;
};
