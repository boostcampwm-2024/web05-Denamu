import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuthStore } from "@/store/useAuthStore.ts";

export default function OAuthSuccessPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    navigate(isAuthenticated ? "/" : "/signin", { replace: true });
  }, [isAuthenticated, isInitialized, navigate]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-lg">로그인 처리 중입니다...</p>
    </div>
  );
}
