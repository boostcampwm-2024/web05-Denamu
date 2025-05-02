import { useEffect, useState } from "react";

export const useRecentTag = () => {
  const [recentTag, setRecentTag] = useState<string[]>(() => {
    const stored = localStorage.getItem("recent-tag");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "recent-tag") {
        const newTags = e.newValue ? JSON.parse(e.newValue) : [];
        setRecentTag(newTags);
      }
    };

    window.addEventListener("storage", handler);
    return () => removeEventListener("storage", handler);
  }, []);

  return recentTag;
};
