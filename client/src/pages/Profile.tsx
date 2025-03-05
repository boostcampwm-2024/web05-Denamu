import { Header } from "@/components/profile/header/Header.tsx";
import { LikedPosts } from "@/components/profile/sections/LikedPosts.tsx";
import { RecentPosts } from "@/components/profile/sections/RecentPosts.tsx";
import { Settings } from "@/components/profile/sections/Settings.tsx";
import { Sidebar } from "@/components/profile/sidebar/Sidebar.tsx";

import { mockUser } from "@/constants/profile";

export default function ProfileLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 ml-64">
        <div className="max-w-4xl mx-auto p-8">
          <Header user={mockUser} />
          <RecentPosts user={mockUser} />
          <LikedPosts />
          <Settings />
        </div>
      </div>
    </div>
  );
}
