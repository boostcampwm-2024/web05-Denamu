import { describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { MyPage } from "@/components/profile/MyPage.tsx";

import { render, screen } from "@testing-library/react";

vi.mock("lucide-react", () => lucideProxy());

vi.mock("@/hooks/queries/useProfile.ts", () => ({
  useUserProfile: () => ({ data: { userName: "민석", profileImage: null, introduction: null } }),
  useActivityYears: () => ({ data: [] }),
  useActivities: () => ({ data: { dailyActivities: [] } }),
  useCertifiedRss: () => ({ data: [] }),
}));

vi.mock("@/hooks/queries/useSubscription.ts", () => ({
  useUserSubscriptions: () => ({ data: [] }),
}));

vi.mock("@/components/profile/ProfileHeader.tsx", () => ({ ProfileHeader: () => <div data-testid="profile-header" /> }));
vi.mock("@/components/profile/StreakStats.tsx", () => ({ StreakStats: () => <div data-testid="streak-stats" /> }));
vi.mock("@/components/profile/header/ui/ActivityGraph/ActivityGraph.tsx", () => ({
  ActivityGraph: () => <div data-testid="activity-graph" />,
}));
vi.mock("@/components/profile/CertifiedRssList.tsx", () => ({ CertifiedRssList: () => <div data-testid="certified-list" /> }));
vi.mock("@/components/profile/LikedList.tsx", () => ({ LikedList: () => <div data-testid="liked-list" /> }));
vi.mock("@/components/profile/CommentList.tsx", () => ({ CommentList: () => <div data-testid="comment-list" /> }));

describe("MyPage", () => {
  it("프로필 헤더와 통계, 활동 그래프, 목록 섹션들을 렌더링해야 한다", () => {
    render(<MyPage userId={1} name="민석" email="min@test.com" isOwner={false} />);

    expect(screen.getByTestId("profile-header")).toBeInTheDocument();
    expect(screen.getByTestId("streak-stats")).toBeInTheDocument();
    expect(screen.getByTestId("activity-graph")).toBeInTheDocument();
    expect(screen.getByTestId("certified-list")).toBeInTheDocument();
    expect(screen.getByTestId("liked-list")).toBeInTheDocument();
    expect(screen.getByTestId("comment-list")).toBeInTheDocument();
  });
});
