import { beforeEach, describe, expect, it, vi } from "vitest";

import SubscriptionFeedList from "@/components/sections/SubscriptionFeedList.tsx";

import { render, screen } from "@testing-library/react";

let feedState: {
  items: unknown[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
};

const gridProps = vi.fn();

vi.mock("@/hooks/queries/useSubscriptionFeed", () => ({
  useSubscriptionFeed: () => feedState,
}));

vi.mock("@/components/sections/InfiniteFeedGrid", () => ({
  default: (props: { items: unknown[]; emptyMessage?: string }) => {
    gridProps(props);
    return <div data-testid="infinite-grid" data-empty={props.emptyMessage} data-count={props.items.length} />;
  },
}));

describe("SubscriptionFeedList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    feedState = {
      items: [{ id: 1 }, { id: 2 }, { id: 3 }],
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
    };
  });

  it("구독 피드 항목과 빈 상태 메시지를 InfiniteFeedGrid에 전달해야 한다", () => {
    render(<SubscriptionFeedList />);

    const grid = screen.getByTestId("infinite-grid");
    expect(grid).toHaveAttribute("data-count", "3");
    expect(grid).toHaveAttribute(
      "data-empty",
      "구독한 블로그의 게시글이 없습니다. 관심 있는 블로그를 구독해보세요."
    );
  });
});
