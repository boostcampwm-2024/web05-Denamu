import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "@/components/layout/Layout";
import { MyPage } from "@/components/profile/MyPage.tsx";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";

import { useAuthStore } from "@/store/useAuthStore.ts";
import { ProfileTab } from "@/types/profile.ts";

const ComingSoon = ({ title }: { title: string }) => (
  <Card>
    <CardContent className="p-8 text-center">
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-gray-400">다음 업데이트에서 제공됩니다.</p>
    </CardContent>
  </Card>
);

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
          {activeTab === "rss" && <ComingSoon title="RSS 관리" />}
          {activeTab === "settings" && <ComingSoon title="정보 수정" />}
        </div>
      </div>
    </Layout>
  );
}
