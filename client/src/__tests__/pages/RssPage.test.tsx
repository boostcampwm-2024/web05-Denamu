import type { ReactNode } from "react";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";

import { RssInfo } from "@/types/profile.ts";
import { render, screen } from "@testing-library/react";

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

vi.mock("@/hooks/queries/useRssPage.ts", () => ({
  useRssInfo: () => rssInfoState,
  useRssPageFeeds: () => ({
    data: { pages: [{ result: [] }] },
    isLoading: false,
    isError: false,
    hasNextPage: false,
    fetchNextPage: vi.fn(),
    isFetchingNextPage: false,
  }),
  useRssActivities: () => ({ data: { dailyActivities: [] } }),
  useRssActivityYears: () => ({ data: [] }),
}));

vi.mock("@/components/profile/header/ui/ActivityGraph/ActivityGraph.tsx", () => ({
  ActivityGraph: ({ unit }: { unit?: string }) => <div data-testid="activity-graph">{unit}</div>,
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
};

describe("RssPage", () => {
  beforeEach(() => {
    rssInfoState = { data: baseRss, isLoading: false, isError: false };
  });

  it("소유자 없는 RSS는 인증 배지와 소유자 카드를 노출하지 않는다", () => {
    render(<RssPage />);

    expect(screen.getByText("데나무 블로그")).toBeInTheDocument();
    expect(screen.queryByText("인증된 RSS")).not.toBeInTheDocument();
    expect(screen.queryByText("소유자")).not.toBeInTheDocument();
    expect(screen.getByTestId("subscribe-button")).toBeInTheDocument();
  });

  it("발행 활동 잔디(ActivityGraph)를 '포스트' 단위로 렌더링한다", () => {
    render(<RssPage />);

    const graph = screen.getByTestId("activity-graph");
    expect(graph).toBeInTheDocument();
    expect(graph).toHaveTextContent("포스트");
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

  it("존재하지 않는 RSS는 NotFound를 렌더링한다", () => {
    rssInfoState = { data: undefined, isLoading: false, isError: true };

    render(<RssPage />);

    expect(screen.queryByText("데나무 블로그")).not.toBeInTheDocument();
  });
});
