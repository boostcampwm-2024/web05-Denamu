import { useNavigate } from "react-router-dom";

import { LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { useUserProfile } from "@/hooks/queries/useProfile";

import { useAuthStore } from "@/store/useAuthStore";

interface AuthSectionProps {
  onAction: () => void;
}

export const AuthSection = ({ onAction }: AuthSectionProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, userInfo, logout } = useAuthStore();
  const { data: profile } = useUserProfile(userInfo.id ?? 0);

  const handleSignIn = () => {
    navigate("/signin");
    onAction();
  };

  const handleProfileClick = () => {
    navigate("/profile");
    onAction();
  };

  const handleLogout = async () => {
    await logout();
    // 로그인 상태 기준으로 캐시된 데이터(React Query 등)를 모두 초기화하기 위해 새로고침
    window.location.reload();
  };

  if (isAuthenticated) {
    const initials = userInfo.userName ? userInfo.userName.substring(0, 2).toUpperCase() : "사용자";

    return (
      <>
        <button
          type="button"
          onClick={handleProfileClick}
          className="flex items-center gap-3 p-4 border rounded-md w-full text-left"
        >
          <Avatar className="h-10 w-10">
            {profile?.profileImage && <AvatarImage src={profile.profileImage} alt={userInfo.userName ?? ""} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{userInfo.userName}</div>
            <div className="text-sm text-muted-foreground">{userInfo.email}</div>
          </div>
        </button>
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
