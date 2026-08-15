import { beforeEach, describe, expect, it, vi } from "vitest";

import { OwnedRssCard } from "@/components/profile/rss/OwnedRssCard.tsx";

import { CertifiedRss } from "@/types/profile.ts";
import { fireEvent, render, screen } from "@testing-library/react";

const visibilityMutate = vi.fn();
let feedsState: {
  data: { pages: Array<{ result: Array<{ id: number; title: string; isPublic: boolean }> }> } | undefined;
  isLoading: boolean;
  isError: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
};

vi.mock("lucide-react", async () => {
  const { lucideProxy } = await import("@/__tests__/__mocks__/external/lucide-proxy.tsx");
  return lucideProxy();
});

vi.mock("@/hooks/common/useCustomToast.ts", () => ({ useCustomToast: () => ({ toast: vi.fn() }) }));
vi.mock("@/hooks/queries/useRssCertification.ts", () => ({
  useOwnedRssFeeds: () => feedsState,
  useSetFeedVisibility: () => ({ mutate: visibilityMutate, isPending: false }),
}));

vi.mock("@/components/profile/rss/SubscribersModal.tsx", () => ({ SubscribersModal: () => null }));
vi.mock("@/components/profile/rss/PlatformIcon.tsx", () => ({
  PlatformIcon: () => <div data-testid="platform-icon" />,
}));
vi.mock("@/components/profile/rss/RssFeedRow.tsx", () => ({
  RssFeedRow: ({ title, onToggleVisibility }: { title: string; onToggleVisibility?: (n: boolean) => void }) => (
    <li data-testid="feed-row">
      {title}
      {onToggleVisibility && <button data-testid="toggle-vis" onClick={() => onToggleVisibility(false)} />}
    </li>
  ),
}));

const rss = {
  id: 10,
  name: "소유 블로그",
  userName: "주인",
  rssUrl: "https://blog.test/rss",
  blogPlatform: "tistory",
  feedCount: 2,
} as CertifiedRss;

describe("OwnedRssCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    feedsState = {
      data: { pages: [{ result: [{ id: 1, title: "피드1", isPublic: true }] }] },
      isLoading: false,
      isError: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
      isFetchingNextPage: false,
    };
  });

  it("블로그명, 소유자, 공개 게시글 수를 렌더링해야 한다", () => {
    render(<OwnedRssCard rss={rss} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText("소유 블로그")).toBeInTheDocument();
    expect(screen.getByText("주인")).toBeInTheDocument();
    expect(screen.getByText(/게시글 2개/)).toBeInTheDocument();
  });

  it("게시글 정지 횟수가 0이어도 정지 횟수를 표시해야 한다", () => {
    render(<OwnedRssCard rss={{ ...rss, suspensionCount: 0 }} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText("정지 0회")).toHaveClass("text-gray-400");
  });

  it.each([
    [1, "text-yellow-500"],
    [2, "text-orange-500"],
    [3, "text-red-500"],
  ])("게시글 정지 횟수가 %i회면 %s 색으로 표시해야 한다", (count, colorClass) => {
    render(<OwnedRssCard rss={{ ...rss, suspensionCount: count }} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText(`정지 ${count}회`)).toHaveClass(colorClass);
  });

  it("수정/삭제 버튼이 onEdit/onDelete 를 호출해야 한다", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(<OwnedRssCard rss={rss} onEdit={onEdit} onDelete={onDelete} />);

    fireEvent.click(screen.getByRole("button", { name: "수정" }));
    fireEvent.click(screen.getByRole("button", { name: "삭제" }));

    expect(onEdit).toHaveBeenCalledWith(rss);
    expect(onDelete).toHaveBeenCalledWith(rss);
  });

  it("펼치면 피드 목록이 보이고 가시성 토글 시 mutate 를 호출해야 한다", () => {
    render(<OwnedRssCard rss={rss} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.queryByTestId("feed-row")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "펼치기" }));

    expect(screen.getByTestId("feed-row")).toHaveTextContent("피드1");
    fireEvent.click(screen.getByTestId("toggle-vis"));
    expect(visibilityMutate).toHaveBeenCalledWith({ feedId: 1, isPublic: false }, expect.any(Object));
  });

  it("펼쳤을 때 로딩/빈 상태 문구를 표시해야 한다", () => {
    feedsState.data = { pages: [{ result: [] }] };
    render(<OwnedRssCard rss={rss} onEdit={vi.fn()} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "펼치기" }));

    expect(screen.getByText("등록된 게시글이 없습니다.")).toBeInTheDocument();
  });

  it("다음 페이지가 있으면 '더 보기' 버튼을 표시해야 한다", () => {
    feedsState.hasNextPage = true;
    render(<OwnedRssCard rss={rss} onEdit={vi.fn()} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "펼치기" }));

    expect(screen.getByRole("button", { name: "더 보기" })).toBeInTheDocument();
  });
});
