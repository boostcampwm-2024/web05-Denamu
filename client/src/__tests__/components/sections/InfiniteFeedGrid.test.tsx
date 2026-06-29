import { beforeEach, describe, expect, it, vi } from "vitest";

import InfiniteFeedGrid from "@/components/sections/InfiniteFeedGrid.tsx";

import { FeedList } from "@/types/post";
import { render, screen } from "@testing-library/react";

vi.mock("@/components/common/Card/PostCardGrid", () => ({
  PostCardGrid: ({ posts }: { posts: unknown[] }) => <div data-testid="post-grid">{posts.length}</div>,
}));

vi.mock("@/components/common/Card/PostCardSkeleton.tsx", () => ({
  PostGridSkeleton: () => <div data-testid="grid-skeleton" />,
}));

const items = [{ id: 1 }, { id: 2 }] as unknown as FeedList[];

const baseProps = {
  items,
  isLoading: false,
  isFetchingNextPage: false,
  hasNextPage: false,
  fetchNextPage: vi.fn(),
};

describe("InfiniteFeedGrid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("로딩 중이면 스켈레톤만 렌더링해야 한다", () => {
    render(<InfiniteFeedGrid {...baseProps} isLoading={true} />);

    expect(screen.getByTestId("grid-skeleton")).toBeInTheDocument();
    expect(screen.queryByTestId("post-grid")).not.toBeInTheDocument();
  });

  it("emptyMessage가 있고 항목이 없으면 빈 상태 문구를 표시해야 한다", () => {
    render(<InfiniteFeedGrid {...baseProps} items={[]} emptyMessage="게시글이 없습니다." />);

    expect(screen.getByText("게시글이 없습니다.")).toBeInTheDocument();
    expect(screen.queryByTestId("post-grid")).not.toBeInTheDocument();
  });

  it("항목이 있으면 PostCardGrid에 전달해야 한다", () => {
    render(<InfiniteFeedGrid {...baseProps} />);

    expect(screen.getByTestId("post-grid")).toHaveTextContent("2");
  });

  it("다음 페이지를 불러오는 중이면 추가 스켈레톤을 렌더링해야 한다", () => {
    render(<InfiniteFeedGrid {...baseProps} isFetchingNextPage={true} />);

    expect(screen.getByTestId("post-grid")).toBeInTheDocument();
    expect(screen.getByTestId("grid-skeleton")).toBeInTheDocument();
  });
});
