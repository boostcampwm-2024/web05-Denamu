import { beforeEach, describe, expect, it, vi } from "vitest";

import LatestFeedList from "@/components/sections/LatestFeedList.tsx";

import { render, screen } from "@testing-library/react";

let feedState: {
  items: unknown[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
};

const gridProps = vi.fn();

vi.mock("@/hooks/queries/useInfiniteScrollQuery", () => ({
  useInfiniteScrollQuery: () => feedState,
}));

vi.mock("@/api/services/posts", () => ({ posts: { latest: vi.fn() } }));

vi.mock("@/components/sections/InfiniteFeedGrid", () => ({
  default: (props: { items: unknown[]; emptyMessage?: string }) => {
    gridProps(props);
    return <div data-testid="infinite-grid" data-empty={props.emptyMessage} data-count={props.items.length} />;
  },
}));

describe("LatestFeedList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    feedState = {
      items: [{ id: 1 }, { id: 2 }],
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
    };
  });

  it("최신 피드 항목을 InfiniteFeedGrid에 전달해야 한다", () => {
    render(<LatestFeedList tags={[]} />);

    const grid = screen.getByTestId("infinite-grid");
    expect(grid).toHaveAttribute("data-count", "2");
  });

  it("emptyMessage 없이 렌더링해야 한다", () => {
    render(<LatestFeedList tags={[]} />);

    expect(screen.getByTestId("infinite-grid")).not.toHaveAttribute("data-empty");
    expect(gridProps.mock.calls[0][0]).not.toHaveProperty("emptyMessage");
  });
});
