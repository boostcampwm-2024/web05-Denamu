import { useNavigate } from "react-router-dom";

import { User, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useUserProfile } from "@/hooks/queries/useProfile";

import { useAuthStore } from "@/store/useAuthStore";

export const UserProfileMenu = () => {
  const { isAuthenticated, userInfo, logout } = useAuthStore();
  const navigate = useNavigate();
  const { data: profile } = useUserProfile(userInfo.id ?? 0);

  const handleLogout = async () => {
    await logout();
    window.location.reload();
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  if (!isAuthenticated) {
    return (
      <Button variant="ghost" size="sm" onClick={() => navigate("/signin")}>
        로그인
      </Button>
    );
  }

  const initials = userInfo.userName ? userInfo.userName.substring(0, 2).toUpperCase() : "사용자";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full mx-2">
          <Avatar className="h-8 w-8">
            {profile?.profileImage && <AvatarImage src={profile.profileImage} alt={userInfo.userName ?? ""} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userInfo.userName}</p>
            <p className="text-xs leading-none text-muted-foreground">{userInfo.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleProfileClick}>
          <User className="mr-2 h-4 w-4" />
          <span>프로필</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>로그아웃</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
