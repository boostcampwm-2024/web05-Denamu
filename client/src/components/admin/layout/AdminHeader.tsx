import { LogOut, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import logo from "@/assets/logo-denamu-main.svg";

import { AdminNavigationMenu } from "./AdminNavigationMenu";
import { auth } from "@/api/services/admin/auth";

export const AdminHeader = ({
  setLogin,
  handleTap,
}: {
  setLogin: () => void;
  handleTap: (tap: "RSS" | "MEMBER") => void;
}) => {
  const handleLogout = () => {
    auth.logout();
    setLogin();
  };
  return (
    <header className="border-b">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <button className="flex-shrink-0" onClick={() => location.reload()}>
              <img className="h-10 w-auto cursor-pointer" src={logo} alt="Logo" />
            </button>

            <AdminNavigationMenu handleTap={handleTap} />
          </div>

          {/* Right Side Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};
