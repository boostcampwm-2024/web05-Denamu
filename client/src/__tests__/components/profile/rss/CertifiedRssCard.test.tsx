import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { CertifiedRssCard } from "@/components/profile/rss/CertifiedRssCard.tsx";

import { CertifiedRss } from "@/types/profile.ts";
import { fireEvent, render, screen } from "@testing-library/react";

let feedsState: {
  data: { pages: Array<{ result: Array<{ id: number; title: string }> }> } | undefined;
  isLoading: boolean;
  isError: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
};

vi.mock("lucide-react", () => lucideProxy());

vi.mock("@/hooks/queries/useProfile.ts", () => ({
  useRssFeeds: () => feedsState,
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("@/hooks/queries/useSubscription.ts", () => ({
  useToggleSubscription: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@/store/useAuthStore.ts", () => ({
  useAuthStore: (selector: (state: { isAuthenticated: boolean }) => unknown) =>
    selector({ isAuthenticated: true }),
}));

vi.mock("@/components/profile/rss/PlatformIcon.tsx", () => ({ PlatformIcon: () => <div data-testid="platform-icon" /> }));
vi.mock("@/components/profile/rss/RssFeedRow.tsx", () => ({
  RssFeedRow: ({ title }: { title: string }) => <li data-testid="feed-row">{title}</li>,
}));

const rss = {
  id: 10,
  name: "내 블로그",
  rssUrl: "https://blog.test/rss",
  blogPlatform: "velog",
  feedCount: 3,
} as CertifiedRss;

describe("CertifiedRssCard", () => {
  beforeEach(() => {
    feedsState = {
      data: { pages: [{ result: [{ id: 1, title: "피드1" }] }] },
      isLoading: false,
      isError: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
      isFetchingNextPage: false,
    };
  });

  it("블로그명, URL, 게시글 수를 렌더링해야 한다", () => {
    render(<CertifiedRssCard userId={1} rss={rss} isOwner={false} />);

    expect(screen.getByText("내 블로그")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "https://blog.test/rss" })).toBeInTheDocument();
    expect(screen.getByText(/게시글 3개/)).toBeInTheDocument();
  });

  it("초기에는 게시글 목록이 접혀 있고 펼치면 RssFeedRow가 보여야 한다", () => {
    render(<CertifiedRssCard userId={1} rss={rss} isOwner={false} />);

    expect(screen.queryByTestId("feed-row")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "게시글 목록 펼치기" }));

    expect(screen.getByTestId("feed-row")).toHaveTextContent("피드1");
  });
});
