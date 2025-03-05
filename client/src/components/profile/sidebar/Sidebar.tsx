import { LogOut, PenTool, Settings, ThumbsUpIcon, User as UserIcon } from "lucide-react";

import { Item } from "@/components/profile/sidebar/Item.tsx";

const sidebarItems = [
  { icon: UserIcon, label: "프로필", id: "profile" },
  { icon: PenTool, label: "최근 작성한 글", id: "recent-posts" },
  { icon: ThumbsUpIcon, label: "좋아요한 목록", id: "liked-posts" },
  { icon: Settings, label: "설정", id: "settings" },
];

export const Sidebar = () => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 fixed h-full">
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <img src="https://denamu.site/files/denamu-icon.svg" alt="Denamu" className="w-10 h-auto" />
            <span className="text-xl font-semibold">Denamu</span>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.id}>
                <Item {...item} />
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button className="flex items-center w-full p-3 text-gray-600 hover:bg-gray-50 rounded-lg">
            <LogOut className="w-5 h-5 mr-3" />
            <span>로그아웃</span>
          </button>
        </div>
      </div>
    </div>
  );
};
