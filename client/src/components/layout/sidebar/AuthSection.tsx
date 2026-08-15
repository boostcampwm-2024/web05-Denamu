import { useNavigate } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { useUserProfile } from "@/hooks/queries/useProfile";

import { useAuthStore } from "@/store/useAuthStore";

interface AuthSectionProps {
  onAction: () => void;
}

export const AuthSection = ({ onAction }: AuthSectionProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, userInfo } = useAuthStore();
  const { data: profile } = useUserProfile(userInfo.id ?? 0);

  const handleSignIn = () => {
    navigate("/signin");
    onAction();
  };

  const handleProfileClick = () => {
    navigate("/profile");
    onAction();
  };

  if (isAuthenticated) {
    const initials = userInfo.userName ? userInfo.userName.substring(0, 2).toUpperCase() : "사용자";

    return (
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
    );
  }

  return (
    <Button variant="outline" className="w-full" onClick={handleSignIn}>
      로그인
    </Button>
  );
};
