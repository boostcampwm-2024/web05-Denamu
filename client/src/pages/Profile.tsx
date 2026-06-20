import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "@/components/layout/Layout";
import { MyPage } from "@/components/profile/MyPage.tsx";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar.tsx";
import { ProfileEditTab } from "@/components/profile/sections/ProfileEditTab.tsx";
import { RssManagementTab } from "@/components/profile/rss/RssManagementTab.tsx";

import { useAuthStore } from "@/store/useAuthStore.ts";
import { ProfileTab } from "@/types/profile.ts";

export default function Profile() {
  const navigate = useNavigate();
  const { isAuthenticated, isInitialized, userInfo } = useAuthStore();
  const [activeTab, setActiveTab] = useState<ProfileTab>("mypage");

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      navigate("/signin");
    }
  }, [isInitialized, isAuthenticated, navigate]);

  if (!isInitialized || !isAuthenticated || userInfo.id === null) {
    return null;
  }

  return (
    <Layout>
      <div className="flex min-h-screen">
        <ProfileSidebar activeTab={activeTab} onTabChange={setActiveTab} isOwner={true} />

        <div className="flex-1 min-w-0 px-4 py-8 md:px-8">
          {activeTab === "mypage" && (
            <MyPage userId={userInfo.id} name={userInfo.userName ?? ""} email={userInfo.email ?? ""} />
          )}
          {activeTab === "rss" && <RssManagementTab userId={userInfo.id} />}
          {activeTab === "settings" && <ProfileEditTab userId={userInfo.id} email={userInfo.email ?? ""} />}
        </div>
      </div>
    </Layout>
  );
}
