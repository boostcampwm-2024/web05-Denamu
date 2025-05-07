import { useNavigate } from "react-router-dom";

import { LogOut, User } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useCustomToast } from "@/hooks/common/useCustomToast";

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
    navigate("/profile");
    onAction();
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "로그아웃 성공",
      description: "성공적으로 로그아웃되었습니다.",
    });
    onAction();
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
