import { useNavigate } from "react-router-dom";

import { LogOut, User } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useCustomToast } from "@/hooks/common/useCustomToast";

import { TOAST_MESSAGES } from "@/constants/messages";

import { useAuthStore } from "@/store/useAuthStore";

interface AuthSectionProps {
  onAction: () => void;
}

export const AuthSection = ({ onAction }: AuthSectionProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, userInfo, logout } = useAuthStore();
  const { toast } = useCustomToast();

  const handleSignIn = () => {
    navigate("/signin");
    onAction();
  };

  const handleProfile = () => {
    toast(TOAST_MESSAGES.SERVICE_NOT_PREPARED);
    onAction();
  };

  const handleLogout = async () => {
    await logout();
    // 로그인 상태 기준으로 캐시된 데이터(React Query 등)를 모두 초기화하기 위해 새로고침
    window.location.reload();
  };

  if (isAuthenticated) {
    return (
      <>
        <div className="p-4 border rounded-md">
          <div className="font-medium">{userInfo.userName}</div>
          <div className="text-sm text-muted-foreground">{userInfo.email}</div>
        </div>
        <Button variant="outline" className="w-full" onClick={handleProfile}>
          <User className="mr-2 h-4 w-4" />
          프로필
        </Button>
        <Button variant="outline" className="w-full" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          로그아웃
        </Button>
      </>
    );
  }

  return (
    <Button variant="outline" className="w-full" onClick={handleSignIn}>
      로그인
    </Button>
  );
};
