import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuthStore } from "@/store/useAuthStore.ts";

export const OAuthSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUserFromToken } = useAuthStore();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const accessToken = searchParams.get("token");

    if (accessToken) {
      setUserFromToken(accessToken);
      navigate("/", { replace: true });
    } else {
      navigate("/signin", { replace: true });
    }
  }, [location, navigate, setUserFromToken]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-lg">로그인 처리 중입니다...</p>
    </div>
  );
};
