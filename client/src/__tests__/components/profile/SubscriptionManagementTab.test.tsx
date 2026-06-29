import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { SubscriptionManagementTab } from "@/components/profile/SubscriptionManagementTab.tsx";

import { SubscribedRss } from "@/types/subscription.ts";
import { fireEvent, render, screen } from "@testing-library/react";

let listState: { data: SubscribedRss[]; isLoading: boolean };

vi.mock("lucide-react", () => lucideProxy());

vi.mock("@/hooks/queries/useSubscription.ts", () => ({
  // userId === 1 → 조회 대상 사용자 목록, 그 외(뷰어 본인) → 빈 목록
  useUserSubscriptions: (userId: number) => (userId === 1 ? listState : { data: [] }),
}));

vi.mock("@/store/useAuthStore.ts", () => ({
  useAuthStore: () => ({ isAuthenticated: false, userInfo: { id: 0 } }),
}));

vi.mock("@/components/common/Card/detail/SubscribeButton.tsx", () => ({
  SubscribeButton: ({ rssId }: { rssId: number }) => <button data-testid={`subscribe-${rssId}`} />,
}));

vi.mock("@/components/profile/rss/PlatformIcon.tsx", () => ({
  PlatformIcon: () => <div data-testid="platform-icon" />,
}));

const rssList: SubscribedRss[] = [
  { id: 1, name: "블로그A", userName: "작가A", rssUrl: "https://a.test/rss", blogPlatform: "velog", feedCount: 5 },
  { id: 2, name: "블로그B", userName: "작가B", rssUrl: "https://b.test/rss", blogPlatform: "tistory", feedCount: 9 },
];

describe("SubscriptionManagementTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listState = { data: rssList, isLoading: false };
  });

  it("로딩 중이면 로딩 문구를 표시해야 한다", () => {
    listState = { data: [], isLoading: true };
    render(<SubscriptionManagementTab userId={1} isOwner={false} onBack={vi.fn()} />);

    expect(screen.getByText("불러오는 중...")).toBeInTheDocument();
  });

  it("구독 목록이 비어 있으면 빈 상태 문구를 표시해야 한다", () => {
    listState = { data: [], isLoading: false };
    render(<SubscriptionManagementTab userId={1} isOwner={false} onBack={vi.fn()} />);

    expect(screen.getByText("구독 중인 RSS가 없습니다.")).toBeInTheDocument();
  });

  it("구독 목록과 각 항목의 SubscribeButton을 렌더링해야 한다", () => {
    render(<SubscriptionManagementTab userId={1} isOwner={false} onBack={vi.fn()} />);

    expect(screen.getByText("블로그A")).toBeInTheDocument();
    expect(screen.getByText("블로그B")).toBeInTheDocument();
    expect(screen.getByTestId("subscribe-1")).toBeInTheDocument();
    expect(screen.getByTestId("subscribe-2")).toBeInTheDocument();
  });

  it("뒤로 버튼 클릭 시 onBack을 호출해야 한다", () => {
    const onBack = vi.fn();
    render(<SubscriptionManagementTab userId={1} isOwner={false} onBack={onBack} />);

    fireEvent.click(screen.getByRole("button", { name: "뒤로" }));
    expect(onBack).toHaveBeenCalled();
  });
});
