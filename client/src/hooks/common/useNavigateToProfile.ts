import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const useNavigateToProfile = () => {
  const navigate = useNavigate();

  return useCallback(
    (userId: number) => {
      navigate(`/profile/${userId}`);
    },
    [navigate]
  );
};
