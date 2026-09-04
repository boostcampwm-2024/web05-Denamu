import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import axios from "axios";

import Layout from "@/components/layout/Layout";
import { BlockManagementTab } from "@/components/profile/BlockManagementTab.tsx";
import { BlockedProfileView } from "@/components/profile/BlockedProfileView.tsx";
import { MyPage } from "@/components/profile/MyPage.tsx";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar.tsx";
import { SubscriptionManagementTab } from "@/components/profile/SubscriptionManagementTab.tsx";
import { SuspendedProfileView } from "@/components/profile/SuspendedProfileView.tsx";
import { RssManagementTab } from "@/components/profile/rss/RssManagementTab.tsx";
import { ProfileEditTab } from "@/components/profile/sections/ProfileEditTab.tsx";

import { useUserProfile } from "@/hooks/queries/useProfile.ts";

import { useAuthStore } from "@/store/useAuthStore.ts";
import { ProfileTab } from "@/types/profile.ts";

export default function Profile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAuthenticated, isInitialized, userInfo } = useAuthStore();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<ProfileTab>(searchParams.get("oauthLink") ? "settings" : "mypage");
  const [showSubscriptions, setShowSubscriptions] = useState(false);

  const targetId = id ? Number(id) : userInfo.id;
  const isOwner = isAuthenticated && userInfo.id !== null && userInfo.id === targetId;
  const isVisitor = !isOwner && !!targetId && !Number.isNaN(targetId);

  const {
    data: visitorProfile,
    isLoading: isVisitorProfileLoading,
    error: visitorProfileError,
  } = useUserProfile(isVisitor ? (targetId as number) : 0);
  const isBlocked = isVisitor && (visitorProfile?.isBlocked ?? false);
  const isSuspended =
    isVisitor && axios.isAxiosError(visitorProfileError) && visitorProfileError.response?.status === 403;

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

  const handleTabChange = (tab: ProfileTab) => {
    setShowSubscriptions(false);
    setActiveTab(tab);
  };

  return (
    <Layout footer>
      <div className="flex flex-col">
        <ProfileSidebar activeTab={currentTab} onTabChange={handleTabChange} isOwner={isOwner} />

        <div className="min-w-0 px-5 py-6 md:py-8 md:px-8 md:w-full md:max-w-4xl md:mx-auto [&_.bg-card]:border-0 [&_.bg-card]:shadow-none [&_.p-6]:p-3 md:[&_.p-6]:p-6 [&_.p-6.pt-0]:pt-0 [&_.mb-8]:mb-4 md:[&_.mb-8]:mb-8">
          {currentTab === "mypage" &&
            (isSuspended ? (
              <SuspendedProfileView />
            ) : isBlocked ? (
              <BlockedProfileView userId={targetId as number} />
            ) : isVisitor && isVisitorProfileLoading ? null : showSubscriptions ? (
              <SubscriptionManagementTab
                userId={targetId as number}
                isOwner={isOwner}
                onBack={() => setShowSubscriptions(false)}
              />
            ) : (
              <MyPage
                userId={targetId as number}
                name={isOwner ? (userInfo.userName ?? "") : ""}
                email={isOwner ? (userInfo.email ?? "") : ""}
                isOwner={isOwner}
                canBlock={isAuthenticated && isVisitor}
                onShowSubscriptions={() => setShowSubscriptions(true)}
              />
            ))}
          {isOwner && currentTab === "rss" && <RssManagementTab userId={targetId as number} />}
          {isOwner && currentTab === "blocks" && <BlockManagementTab />}
          {isOwner && currentTab === "settings" && (
            <ProfileEditTab userId={targetId as number} email={userInfo.email ?? ""} />
          )}
        </div>
      </div>
    </Layout>
  );
}
