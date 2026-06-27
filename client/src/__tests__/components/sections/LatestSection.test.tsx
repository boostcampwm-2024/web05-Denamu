import { beforeEach, describe, expect, it, vi } from "vitest";

import LatestSection from "@/components/sections/LatestSection.tsx";

import { render, screen } from "@testing-library/react";

let filterState: { filters: string[]; removeAll: () => void };
let postType: "latest" | "recommend";
let infiniteState: {
  items: unknown[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
};

vi.mock("lucide-react", async () => {
  const { lucideProxy } = await import("@/__tests__/__mocks__/external/lucide-proxy.tsx");
  return lucideProxy();
});

vi.mock("@/store/useFilterStore", () => ({
  useFilterStore: (selector: (s: typeof filterState) => unknown) => selector(filterState),
}));

vi.mock("@/store/usePostTypeStore", () => ({
  usePostTypeStore: (selector: (s: { postType: string }) => unknown) => selector({ postType }),
}));

vi.mock("@/hooks/common/useRecentTag", () => ({ useRecentTag: () => [] }));

vi.mock("@/hooks/queries/useInfiniteScrollQuery", () => ({
  useInfiniteScrollQuery: () => infiniteState,
}));

vi.mock("@/api/services/posts", () => ({ posts: { latest: vi.fn() } }));

vi.mock("@/components/common/SectionHeader", () => ({
  SectionHeader: ({ text }: { text: string }) => <div>{text}</div>,
}));

vi.mock("@/components/common/Card/PostCardGrid", () => ({
  PostCardGrid: ({ posts }: { posts: unknown[] }) => <div data-testid="post-grid">{posts.length}</div>,
}));

vi.mock("@/components/common/Card/PostCardSkeleton.tsx", () => ({
  PostGridSkeleton: () => <div data-testid="grid-skeleton" />,
}));

vi.mock("@/components/filter/Filter", () => ({ default: () => <div data-testid="filter" /> }));

vi.mock("@/components/sections/LatestSectionTimer", () => ({ default: () => <div data-testid="timer" /> }));

describe("LatestSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    filterState = { filters: [], removeAll: vi.fn() };
    postType = "latest";
    infiniteState = {
      items: [{ id: 1 }, { id: 2 }],
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
    };
  });

  it("로딩 중이면 PostGridSkeleton을 렌더링해야 한다", () => {
    infiniteState.isLoading = true;
    render(<LatestSection />);

    expect(screen.getByTestId("grid-skeleton")).toBeInTheDocument();
    expect(screen.queryByTestId("post-grid")).not.toBeInTheDocument();
  });

  it("로딩 완료 시 PostCardGrid에 items를 전달해야 한다", () => {
    render(<LatestSection />);

    expect(screen.getByTestId("post-grid")).toHaveTextContent("2");
  });

  it("postType이 latest이면 Filter를 렌더링해야 한다", () => {
    render(<LatestSection />);

    expect(screen.getByTestId("filter")).toBeInTheDocument();
  });

  it("postType이 latest가 아니면 Filter를 렌더링하지 않아야 한다", () => {
    postType = "recommend";
    render(<LatestSection />);

    expect(screen.queryByTestId("filter")).not.toBeInTheDocument();
  });

  it("선택된 필터가 있으면 Badge로 표시되어야 한다", () => {
    filterState.filters = ["React", "TypeScript"];
    render(<LatestSection />);

    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });

  it("다음 페이지를 불러오는 중이면 추가 스켈레톤이 렌더링되어야 한다", () => {
    infiniteState.isFetchingNextPage = true;
    render(<LatestSection />);

    expect(screen.getByTestId("grid-skeleton")).toBeInTheDocument();
  });
});
