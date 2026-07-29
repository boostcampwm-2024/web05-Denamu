import { ChevronDown, LogOut, User } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import logo from "@/assets/logo-denamu-main.svg";

import { AdminNavigationMenu } from "./AdminNavigationMenu";
import { auth } from "@/api/services/admin/auth";

export const AdminHeader = ({
  setLogin,
  handleTap,
  name,
}: {
  setLogin: () => void;
  handleTap: (tap: "RSS" | "MEMBER" | "MYPAGE" | "POST" | "CHAT" | "REPORT" | "BOARD") => void;
  name?: string;
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
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-2 rounded-md px-2 py-1.5 outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring">
                <User className="h-5 w-5" />
                {name && <span className="text-sm font-medium">{name}</span>}
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleTap("MYPAGE")}>
                  <User className="mr-2 h-4 w-4" />
                  프로필
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={handleLogout}>
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
