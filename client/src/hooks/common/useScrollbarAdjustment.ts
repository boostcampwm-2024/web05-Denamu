import { useEffect, useState } from "react";

export const useScrollbarAdjustment = () => {
  const [scrollbarWidth, setScrollbarWidth] = useState(0);

  useEffect(() => {
    const width = window.innerWidth - document.documentElement.clientWidth;
    setScrollbarWidth(width);

    document.body.style.paddingRight = `${width}px`;
    document.querySelectorAll(".side-btn").forEach((btn) => {
      (btn as HTMLElement).style.transform = `translateX(-${width}px)`;
    });
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.paddingRight = "";
      document.querySelectorAll(".side-btn").forEach((btn) => {
        (btn as HTMLElement).style.transform = "";
      });
      document.body.style.overflow = "auto";
    };
  }, []);

  return scrollbarWidth;
};
