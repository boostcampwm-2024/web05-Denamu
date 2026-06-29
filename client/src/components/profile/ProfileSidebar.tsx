import { useNavigate } from "react-router-dom";

import { Home, LogOut, Rss, Settings as SettingsIcon, User as UserIcon } from "lucide-react";

import { useCustomToast } from "@/hooks/common/useCustomToast.ts";

import { cn } from "@/lib/utils.ts";

import { useAuthStore } from "@/store/useAuthStore.ts";
import { ProfileTab } from "@/types/profile.ts";

interface ProfileSidebarProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  isOwner: boolean;
}

const tabs: { id: ProfileTab; label: string; icon: typeof UserIcon }[] = [
  { id: "mypage", label: "마이페이지", icon: UserIcon },
  { id: "rss", label: "RSS 관리", icon: Rss },
  { id: "settings", label: "정보 수정", icon: SettingsIcon },
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

  return (
    <aside className="w-64 shrink-0 border-r border-gray-200 bg-white">
      <div className="sticky top-0 flex flex-col p-4">
        <nav className="flex-1">
          <button
            onClick={() => navigate("/")}
            className="flex items-center w-full p-3 mb-2 text-gray-600 rounded-lg hover:bg-gray-50"
          >
            <Home className="w-5 h-5 mr-3" />
            <span>홈으로</span>
          </button>

          {isOwner && (
            <ul className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = tab.id === activeTab;
                return (
                  <li key={tab.id}>
                    <button
                      onClick={() => onTabChange(tab.id)}
                      className={cn(
                        "flex items-center w-full p-3 rounded-lg transition-colors",
                        isActive
                          ? tab.id === "rss"
                            ? "bg-[#FF870D]/10 text-[#FF870D] font-semibold"
                            : tab.id === "settings"
                              ? "bg-purple-50 text-purple-600 font-semibold"
                              : "bg-blue-50 text-blue-600 font-semibold"
                          : "text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      <span>{tab.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </nav>

        {isOwner && (
          <div className="pt-4 mt-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full p-3 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span>로그아웃</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
