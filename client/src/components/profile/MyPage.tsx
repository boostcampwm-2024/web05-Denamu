import { useState } from "react";

import { Bell, ChevronRight } from "lucide-react";

import { ActivityGraph } from "@/components/profile/header/ui/ActivityGraph/ActivityGraph.tsx";
import { CertifiedRssList } from "@/components/profile/CertifiedRssList.tsx";
import { CommentList } from "@/components/profile/CommentList.tsx";
import { LikedList } from "@/components/profile/LikedList.tsx";
import { ProfileHeader } from "@/components/profile/ProfileHeader.tsx";
import { StreakStats } from "@/components/profile/StreakStats.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";

import { useActivities, useActivityYears, useCertifiedRss, useUserProfile } from "@/hooks/queries/useProfile.ts";
import { useUserSubscriptions } from "@/hooks/queries/useSubscription.ts";

interface MyPageProps {
  userId: number;
  name: string;
  email: string;
  isOwner: boolean;
  onShowSubscriptions?: () => void;
}

const MAX_YEARS = 5;

export const MyPage = ({ userId, name, email, isOwner, onShowSubscriptions }: MyPageProps) => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  const { data: profile } = useUserProfile(userId);
  const { data: activityYears = [] } = useActivityYears(userId);
  const { data: activity } = useActivities(userId, year);
  const { data: rssList } = useCertifiedRss(userId);
  const { data: subscriptions = [] } = useUserSubscriptions(userId);

  // 현재 연도 기준 최근 5년 윈도우 중 데이터가 있는 연도만 노출. 올해는 기본값이라 항상 포함.
  const years = Array.from({ length: MAX_YEARS }, (_, i) => currentYear - i).filter(
    (y) => y === currentYear || activityYears.includes(y)
  );

  return (
    <>
      <ProfileHeader
        name={profile?.userName ?? name}
        email={email}
        profileImage={profile?.profileImage ?? null}
        introduction={profile?.introduction ?? null}
      />

      <StreakStats
        maxStreak={profile?.maxStreak ?? 0}
        currentStreak={profile?.currentStreak ?? 0}
        totalViews={profile?.totalViews ?? 0}
      />

      <Card className="mb-8">
        <CardContent className="p-0">
          <button
            onClick={onShowSubscriptions}
            className="flex items-center justify-between w-full p-6 text-left transition-colors hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-[#FF870D]" />
              <span className="font-semibold">구독 중인 RSS</span>
              <span className="text-lg font-bold text-[#FF870D]">{subscriptions.length}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </CardContent>
      </Card>

      <CertifiedRssList userId={userId} rssList={rssList ?? []} isOwner={isOwner} />

      <Card className="mb-8">
        <CardContent className="p-6">
          <ActivityGraph
            dailyActivities={activity?.dailyActivities ?? []}
            year={year}
            years={years}
            onYearChange={setYear}
          />
        </CardContent>
      </Card>

      <LikedList userId={userId} />
      <CommentList userId={userId} />
    </>
  );
};
