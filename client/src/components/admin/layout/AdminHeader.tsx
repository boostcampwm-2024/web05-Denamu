import { LogOut, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import logo from "@/assets/logo-denamu-main.svg";

import { AdminNavigationMenu } from "./AdminNavigationMenu";
import { auth } from "@/api/services/admin/auth";

export const AdminHeader = ({
  setLogin,
  handleTap,
  name,
  parent,
}: {
  setLogin: () => void;
  handleTap: (tap: "RSS" | "MEMBER") => void;
  name?: string;
  parent?: { email: string; name: string } | null;
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-2 cursor-help">
                    <User className="h-5 w-5" />
                    {name && <span className="text-sm font-medium">{name}</span>}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {parent ? (
                    <span>
                      상위 계정: {parent.name} ({parent.email})
                    </span>
                  ) : (
                    <span>Root 계정이라 부모 계정이 없습니다.</span>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button variant="ghost" className="text-red-600" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              로그아웃
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
