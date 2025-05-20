import { useNavigate } from "react-router-dom";

import { User, LogOut } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useCustomToast } from "@/hooks/common/useCustomToast";

import { TOAST_MESSAGES } from "@/constants/messages";

import { useAuthStore } from "@/store/useAuthStore";

export const UserProfileMenu = () => {
  const { isAuthenticated, userInfo, logout } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useCustomToast();

  const handleLogout = () => {
    logout();
    toast({
      title: "로그아웃 성공",
      description: "성공적으로 로그아웃되었습니다.",
    });
  };

  const handleProfileClick = () => {
    toast(TOAST_MESSAGES.SERVICE_NOT_PREPARED);
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
