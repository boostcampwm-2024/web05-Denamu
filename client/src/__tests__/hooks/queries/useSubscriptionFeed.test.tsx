import { beforeEach, describe, expect, it, vi } from "vitest";

import { subscriptions } from "@/api/services/subscriptions";
import { useInfiniteScrollQuery } from "@/hooks/queries/useInfiniteScrollQuery";
import { useSubscriptionFeed } from "@/hooks/queries/useSubscriptionFeed";

import { renderHook } from "@testing-library/react";

vi.mock("@/api/services/subscriptions", () => ({
  subscriptions: { feed: vi.fn() },
}));

vi.mock("@/hooks/queries/useInfiniteScrollQuery", () => ({
  useInfiniteScrollQuery: vi.fn(() => ({ items: [] })),
}));

describe("useSubscriptionFeed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("subscriptionFeed 키와 subscriptions.feed fetcher, 빈 tags로 무한 스크롤 쿼리를 구성한다", () => {
    renderHook(() => useSubscriptionFeed());

    expect(useInfiniteScrollQuery).toHaveBeenCalledWith({
      queryKey: "subscriptionFeed",
      fetchFn: subscriptions.feed,
      tags: [],
    });
  });
});
