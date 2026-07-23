import type { ReactNode } from "react";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";

import { RssInfo } from "@/types/profile.ts";
import { fireEvent, render, screen } from "@testing-library/react";

let rssInfoState: { data: RssInfo | undefined; isLoading: boolean; isError: boolean };

vi.mock("lucide-react", () => lucideProxy());

vi.mock("react-router-dom", () => ({
  useParams: () => ({ rssId: "5" }),
  useNavigate: () => vi.fn(),
  Link: ({ to, children, ...props }: { to: string; children: ReactNode }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/layout/Layout", () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

const useRssPageFeedsMock = vi.hoisted(() =>
  vi.fn<(rssId: number, date?: string) => object>(() => ({
    data: { pages: [{ result: [] }] },
    isLoading: false,
    isError: false,
    hasNextPage: false,
    fetchNextPage: vi.fn(),
    isFetchingNextPage: false,
  }))
);

vi.mock("@/hooks/queries/useRssPage.ts", () => ({
  useRssInfo: () => rssInfoState,
  useRssPageFeeds: (rssId: number, date?: string) => useRssPageFeedsMock(rssId, date),
  useRssActivities: () => ({ data: { dailyActivities: [] } }),
  useRssActivityYears: () => ({ data: [] }),
}));

vi.mock("@/components/profile/header/ui/ActivityGraph/ActivityGraph.tsx", () => ({
  ActivityGraph: ({
    scale,
    onDayClick,
  }: {
    scale?: string;
    onDayClick?: (dateStr: string) => void;
  }) => (
    <div data-testid="activity-graph">
      {scale}
      <button data-testid="day-cell" onClick={() => onDayClick?.("2025-01-15")}>
        cell
      </button>
    </div>
  ),
}));

const blockRssMock = vi.hoisted(() => vi.fn());
const unblockRssMock = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/queries/useBlock.ts", () => ({
  useBlockRss: () => ({ mutate: blockRssMock, isPending: false }),
  useUnblockRss: () => ({ mutate: unblockRssMock, isPending: false }),
}));

vi.mock("@/hooks/queries/useRssCertification.ts", () => ({
  useOwnedRssFeeds: () => ({
    data: { pages: [{ result: [] }] },
    isLoading: false,
    isError: false,
    hasNextPage: false,
    fetchNextPage: vi.fn(),
    isFetchingNextPage: false,
  }),
  useSetFeedVisibility: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@/components/common/Card/detail/SubscribeButton.tsx", () => ({
  SubscribeButton: () => <button data-testid="subscribe-button">구독</button>,
}));
vi.mock("@/components/profile/rss/PlatformIcon.tsx", () => ({ PlatformIcon: () => <div data-testid="platform-icon" /> }));
vi.mock("@/components/profile/rss/RssFeedCard.tsx", () => ({ RssFeedCard: () => <li data-testid="feed-card" /> }));
vi.mock("@/components/profile/rss/RssFeedRow.tsx", () => ({ RssFeedRow: () => <li data-testid="feed-row" /> }));
vi.mock("@/components/profile/rss/RssEditModal.tsx", () => ({
  RssEditModal: ({ target }: { target: unknown }) => (target ? <div data-testid="edit-modal" /> : null),
}));

import RssPage from "@/pages/RssPage.tsx";

import { useAuthStore } from "@/store/useAuthStore";

const baseRss: RssInfo = {
  id: 5,
  name: "데나무 블로그",
  userName: "작성자",
  rssUrl: "https://blog.test/rss",
  blogPlatform: "velog",
  feedCount: 12,
  subscriberCount: 3,
  isSubscribed: false,
  isOwner: false,
  lastPublishedAt: "2025-01-10T00:00:00Z",
  owner: null,
  isBlocked: false,
};

describe("RssPage", () => {
  beforeEach(() => {
    rssInfoState = { data: baseRss, isLoading: false, isError: false };
    useAuthStore.setState({ isAuthenticated: false });
  });

  it("소유자 없는 RSS는 인증 배지와 소유자 카드를 노출하지 않는다", () => {
    render(<RssPage />);

    expect(screen.getByText("데나무 블로그")).toBeInTheDocument();
    expect(screen.queryByText("인증된 RSS")).not.toBeInTheDocument();
    expect(screen.queryByText("소유자")).not.toBeInTheDocument();
    expect(screen.getByTestId("subscribe-button")).toBeInTheDocument();
  });

  it("발행 활동 잔디(ActivityGraph)를 posts 스케일로 렌더링한다", () => {
    render(<RssPage />);

    const graph = screen.getByTestId("activity-graph");
    expect(graph).toBeInTheDocument();
    expect(graph).toHaveTextContent("posts");
  });

  it("소유자 있는 RSS는 인증 배지와 소유자 프로필 링크를 노출한다", () => {
    rssInfoState = {
      data: { ...baseRss, owner: { id: 99, userName: "김개발", profileImage: null } },
      isLoading: false,
      isError: false,
    };

    render(<RssPage />);

    expect(screen.getByText("인증된 RSS")).toBeInTheDocument();
    expect(screen.getByText("소유자")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /김개발/ })).toHaveAttribute("href", "/profile/99");
  });

  it("본인 소유 RSS는 정보 수정 버튼과 공개 관리 섹션을 노출하고 구독 버튼은 숨긴다", () => {
    rssInfoState = {
      data: {
        ...baseRss,
        isOwner: true,
        owner: { id: 99, userName: "김개발", profileImage: null },
      },
      isLoading: false,
      isError: false,
    };

    render(<RssPage />);

    expect(screen.getByRole("button", { name: "정보 수정" })).toBeInTheDocument();
    expect(screen.getByText("포스트 공개 관리")).toBeInTheDocument();
    expect(screen.queryByTestId("subscribe-button")).not.toBeInTheDocument();
  });

  it("잔디 칸 클릭 시 해당 날짜로 포스트를 필터링하고, 재클릭 시 해제한다", () => {
    render(<RssPage />);

    expect(useRssPageFeedsMock).toHaveBeenLastCalledWith(5, undefined);

    fireEvent.click(screen.getByTestId("day-cell"));

    expect(useRssPageFeedsMock).toHaveBeenLastCalledWith(5, "2025-01-15");
    expect(screen.getByText("2025-01-15 발행분")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("day-cell"));

    expect(useRssPageFeedsMock).toHaveBeenLastCalledWith(5, undefined);
    expect(screen.queryByText("2025-01-15 발행분")).not.toBeInTheDocument();
  });

  it("존재하지 않는 RSS는 NotFound를 렌더링한다", () => {
    rssInfoState = { data: undefined, isLoading: false, isError: true };

    render(<RssPage />);

    expect(screen.queryByText("데나무 블로그")).not.toBeInTheDocument();
  });

  it("로그인한 비소유자에게는 더보기(차단) 버튼을 노출한다", () => {
    useAuthStore.setState({ isAuthenticated: true });

    render(<RssPage />);

    expect(screen.getByRole("button", { name: "더보기" })).toBeInTheDocument();
  });

  it("비로그인 사용자에게는 더보기 버튼을 노출하지 않는다", () => {
    render(<RssPage />);

    expect(screen.queryByRole("button", { name: "더보기" })).not.toBeInTheDocument();
  });

  it("본인 소유 RSS에는 더보기 버튼을 노출하지 않는다", () => {
    useAuthStore.setState({ isAuthenticated: true });
    rssInfoState = { data: { ...baseRss, isOwner: true }, isLoading: false, isError: false };

    render(<RssPage />);

    expect(screen.queryByRole("button", { name: "더보기" })).not.toBeInTheDocument();
  });

  it("차단된 RSS는 차단 안내 뷰를 렌더링하고 본문은 숨긴다", () => {
    rssInfoState = { data: { ...baseRss, isBlocked: true }, isLoading: false, isError: false };

    render(<RssPage />);

    expect(screen.getByText("차단된 RSS입니다.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "홈으로" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "차단 해제" })).toBeInTheDocument();
    expect(screen.queryByText("데나무 블로그")).not.toBeInTheDocument();
  });

  it("차단 안내 뷰에서 차단 해제 클릭 시 해당 rssId로 mutation을 호출한다", () => {
    rssInfoState = { data: { ...baseRss, isBlocked: true }, isLoading: false, isError: false };

    render(<RssPage />);

    fireEvent.click(screen.getByRole("button", { name: "차단 해제" }));

    expect(unblockRssMock).toHaveBeenCalledWith(5, expect.any(Object));
  });
});
