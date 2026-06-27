import { beforeEach, describe, expect, it, vi } from "vitest";

import TrendingSection from "@/components/sections/TrendingSection.tsx";

import { render, screen } from "@testing-library/react";

const useTrendingPostsMock = vi.fn();
const isMobileMock = vi.fn(() => false);

vi.mock("lucide-react", async () => {
  const { lucideProxy } = await import("@/__tests__/__mocks__/external/lucide-proxy.tsx");
  return lucideProxy();
});

vi.mock("@/hooks/queries/useTrendingPosts", () => ({
  useTrendingPosts: () => useTrendingPostsMock(),
}));

vi.mock("@/store/useMediaStore", () => ({
  useMediaStore: (selector: (s: { isMobile: boolean }) => unknown) => selector({ isMobile: isMobileMock() }),
}));

vi.mock("@/components/common/SectionHeader", () => ({
  SectionHeader: ({ text }: { text: string }) => <div data-testid="section-header">{text}</div>,
}));

vi.mock("@/components/common/Card/PostCardSkeleton.tsx", () => ({
  PostGridSkeleton: () => <div data-testid="grid-skeleton" />,
}));

vi.mock("@/components/sections/AnimatedPostGrid", () => ({
  default: ({ posts }: { posts: unknown[] }) => <div data-testid="animated-grid">{posts.length}</div>,
}));

describe("TrendingSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isMobileMock.mockReturnValue(false);
  });

  it("로딩 중이면 PostGridSkeleton을 렌더링해야 한다", () => {
    useTrendingPostsMock.mockReturnValue({ posts: [], isLoading: true });
    render(<TrendingSection />);

    expect(screen.getByTestId("grid-skeleton")).toBeInTheDocument();
    expect(screen.queryByTestId("animated-grid")).not.toBeInTheDocument();
  });

  it("로딩 완료 시 AnimatedPostGrid에 posts를 전달해야 한다", () => {
    useTrendingPostsMock.mockReturnValue({ posts: [{ id: 1 }, { id: 2 }], isLoading: false });
    render(<TrendingSection />);

    expect(screen.getByTestId("animated-grid")).toHaveTextContent("2");
  });

  it("섹션 헤더 '트렌딩 포스트'를 렌더링해야 한다", () => {
    useTrendingPostsMock.mockReturnValue({ posts: [], isLoading: false });
    render(<TrendingSection />);

    expect(screen.getByText("트렌딩 포스트")).toBeInTheDocument();
  });
});
