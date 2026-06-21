import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Layout from "@/components/layout/Layout";
import { MyPage } from "@/components/profile/MyPage.tsx";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar.tsx";
import { RssManagementTab } from "@/components/profile/rss/RssManagementTab.tsx";
import { ProfileEditTab } from "@/components/profile/sections/ProfileEditTab.tsx";

import { useAuthStore } from "@/store/useAuthStore.ts";
import { ProfileTab } from "@/types/profile.ts";

export default function Profile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAuthenticated, isInitialized, userInfo } = useAuthStore();
  const [activeTab, setActiveTab] = useState<ProfileTab>("mypage");

  const targetId = id ? Number(id) : userInfo.id;
  const isOwner = isAuthenticated && userInfo.id !== null && userInfo.id === targetId;

  useEffect(() => {
    if (!isInitialized) return;
    if (!id && !isAuthenticated) {
      navigate("/signin");
    }
  }, [isInitialized, isAuthenticated, id, navigate]);

  if (!isInitialized) {
    return null;
  }
  if (!id && (!isAuthenticated || userInfo.id === null)) {
    return null;
  }
  if (id && (!targetId || Number.isNaN(targetId))) {
    return null;
  }

  const currentTab: ProfileTab = isOwner ? activeTab : "mypage";

  return (
    <Layout>
      <div className="flex min-h-screen">
        <ProfileSidebar activeTab={currentTab} onTabChange={setActiveTab} isOwner={isOwner} />

        <div className="flex-1 min-w-0 px-4 py-8 md:px-8">
          {currentTab === "mypage" && (
            <MyPage
              userId={targetId as number}
              name={isOwner ? (userInfo.userName ?? "") : ""}
              email={isOwner ? (userInfo.email ?? "") : ""}
            />
          )}
          {isOwner && currentTab === "rss" && <RssManagementTab userId={targetId as number} />}
          {isOwner && currentTab === "settings" && (
            <ProfileEditTab userId={targetId as number} email={userInfo.email ?? ""} />
          )}
        </div>
      </div>
    </Layout>
  );
}
