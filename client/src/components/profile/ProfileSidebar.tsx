import { useNavigate } from "react-router-dom";

import { Ban, LogOut, Rss, Settings as SettingsIcon, User as UserIcon } from "lucide-react";

import { useCustomToast } from "@/hooks/common/useCustomToast.ts";

import { cn } from "@/lib/utils.ts";
import { useAuthStore } from "@/store/useAuthStore.ts";
import { ProfileTab } from "@/types/profile.ts";

interface ProfileSidebarProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  isOwner: boolean;
}

const tabs: { id: ProfileTab; label: string; icon: typeof UserIcon; activeClass: string }[] = [
  { id: "mypage", label: "마이페이지", icon: UserIcon, activeClass: "bg-blue-50 text-blue-600" },
  { id: "rss", label: "RSS 관리", icon: Rss, activeClass: "bg-[#FF870D]/10 text-[#FF870D]" },
  { id: "blocks", label: "차단 관리", icon: Ban, activeClass: "bg-red-50 text-red-600" },
  { id: "settings", label: "정보 수정", icon: SettingsIcon, activeClass: "bg-purple-50 text-purple-600" },
];

export const ProfileSidebar = ({ activeTab, onTabChange, isOwner }: ProfileSidebarProps) => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { toast } = useCustomToast();

  const handleLogout = () => {
    logout();
    toast({ title: "로그아웃 성공", description: "성공적으로 로그아웃되었습니다." });
    navigate("/");
  };

  const itemClass = (isActive?: boolean, activeClass?: string) =>
    cn(
      "flex items-center gap-3 shrink-0 p-3 md:w-full rounded-lg transition-colors whitespace-nowrap",
      isActive ? cn(activeClass, "font-semibold") : "text-gray-600 hover:bg-gray-50"
    );

  return (
    <aside
      className={cn(
        "w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-gray-200 bg-white",
        !isOwner && "hidden"
      )}
    >
      <nav className="sticky top-0 z-10 flex flex-row md:flex-col gap-2 md:gap-0 overflow-x-auto md:overflow-visible bg-white p-4">
        {isOwner &&
          tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(itemClass(tab.id === activeTab, tab.activeClass), "md:mb-2")}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}

        {isOwner && (
          <button
            onClick={handleLogout}
            className={cn(
              itemClass(),
              "hidden md:flex md:mt-2 md:pt-4 md:border-t border-gray-200 hover:bg-red-50 hover:text-red-600"
            )}
          >
            <LogOut className="w-5 h-5" />
            <span>로그아웃</span>
          </button>
        )}
      </nav>
    </aside>
  );
};
