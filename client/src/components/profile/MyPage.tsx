import { useState } from "react";

import { ActivityGraph } from "@/components/profile/header/ui/ActivityGraph/ActivityGraph.tsx";
import { CertifiedRssList } from "@/components/profile/CertifiedRssList.tsx";
import { CommentList } from "@/components/profile/CommentList.tsx";
import { LikedList } from "@/components/profile/LikedList.tsx";
import { ProfileHeader } from "@/components/profile/ProfileHeader.tsx";
import { StreakStats } from "@/components/profile/StreakStats.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";

import { useActivities, useActivityYears, useCertifiedRss, useUserProfile } from "@/hooks/queries/useProfile.ts";

interface MyPageProps {
  userId: number;
  name: string;
  email: string;
}

const MAX_YEARS = 5;

export const MyPage = ({ userId, name, email }: MyPageProps) => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  const { data: profile } = useUserProfile(userId);
  const { data: activityYears = [] } = useActivityYears(userId);
  const { data: activity } = useActivities(userId, year);
  const { data: rssList } = useCertifiedRss(userId);

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
        <CardContent className="p-6">
          <ActivityGraph
            dailyActivities={activity?.dailyActivities ?? []}
            year={year}
            years={years}
            onYearChange={setYear}
          />
        </CardContent>
      </Card>

      <CertifiedRssList userId={userId} rssList={rssList ?? []} />

      <LikedList userId={userId} />
      <CommentList userId={userId} />
    </>
  );
};
