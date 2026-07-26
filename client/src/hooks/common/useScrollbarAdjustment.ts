import { useEffect, useState } from "react";

export const useScrollbarAdjustment = () => {
  const [scrollbarWidth, setScrollbarWidth] = useState(0);

  useEffect(() => {
    const width = window.innerWidth - document.documentElement.clientWidth;
    setScrollbarWidth(width);

    document.body.style.setProperty("padding-right", `${width}px`, "important");
    document.querySelectorAll(".side-btn").forEach((btn) => {
      (btn as HTMLElement).style.transform = `translateX(-${width}px)`;
    });
    const fixedFooter = document.querySelector<HTMLElement>('[data-testid="scroll-aware-footer"]');
    fixedFooter?.style.setProperty("padding-right", `${width}px`, "important");
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.paddingRight = "";
      document.querySelectorAll(".side-btn").forEach((btn) => {
        (btn as HTMLElement).style.transform = "";
      });
      fixedFooter?.style.removeProperty("padding-right");
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "auto";
    };
  }, []);

  return scrollbarWidth;
};
