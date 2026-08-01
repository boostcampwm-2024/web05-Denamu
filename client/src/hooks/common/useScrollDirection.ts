import { useEffect, useRef, useState } from "react";

type ScrollDirection = "up" | "down";

const THRESHOLD = 6;

export const useScrollDirection = (): ScrollDirection => {
  const [direction, setDirection] = useState<ScrollDirection>("down");
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const diff = currentY - lastY.current;

      if (currentY <= 0) {
        setDirection("up");
        lastY.current = currentY;
        return;
      }
      if (Math.abs(diff) < THRESHOLD) return;

      setDirection(diff > 0 ? "down" : "up");
      lastY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return direction;
};
