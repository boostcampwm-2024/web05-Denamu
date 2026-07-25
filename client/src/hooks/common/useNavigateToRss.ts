import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const useNavigateToRss = () => {
  const navigate = useNavigate();

  return useCallback(
    (rssId: number) => {
      navigate(`/rss/${rssId}`);
    },
    [navigate]
  );
};
