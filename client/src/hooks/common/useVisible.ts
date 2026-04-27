import { useEffect, useState } from "react";

export const useVisible = () => {
  const [visible, setVisible] = useState<boolean>(true);
  useEffect(() => {
    const handleVisible = () => {
      const isVisible = document.visibilityState === "visible";
      setVisible(isVisible);
    };
    document.addEventListener("visibilitychange", handleVisible);
    return () => {
      document.removeEventListener("visibilitychange", handleVisible);
    };
  }, []);
  return visible;
};
