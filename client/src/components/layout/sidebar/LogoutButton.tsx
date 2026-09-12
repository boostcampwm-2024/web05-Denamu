import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useAuthStore } from "@/store/useAuthStore";

export const LogoutButton = () => {
  const { isAuthenticated, logout } = useAuthStore();

  if (!isAuthenticated) return null;

  const handleLogout = async () => {
    await logout();
    window.location.reload();
  };

  return (
    <Button variant="outline" className="w-full text-red-500" onClick={handleLogout}>
      <LogOut className="mr-2 h-4 w-4" />
      로그아웃
    </Button>
  );
};
