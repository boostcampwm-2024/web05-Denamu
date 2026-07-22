import { MemoryRouter } from "react-router-dom";

import { beforeEach, describe, expect, it, vi } from "vitest";

import RecentRssSection from "@/components/sections/RecentRssSection.tsx";

import { render, screen } from "@testing-library/react";

const useRecentRssMock = vi.fn();

vi.mock("lucide-react", async () => {
  const { lucideProxy } = await import("@/__tests__/__mocks__/external/lucide-proxy.tsx");
  return lucideProxy();
});

vi.mock("@/hooks/queries/useRecentRss", () => ({
  useRecentRss: () => useRecentRssMock(),
}));

vi.mock("@/components/common/SectionHeader", () => ({
  SectionHeader: ({ text }: { text: string }) => <div data-testid="section-header">{text}</div>,
}));

vi.mock("@/components/profile/rss/PlatformIcon", () => ({
  PlatformIcon: ({ platform }: { platform: string }) => (
    <div data-testid="platform-icon" data-platform={platform} />
  ),
}));

const renderSection = () =>
  render(
    <MemoryRouter>
      <RecentRssSection />
    </MemoryRouter>
  );

describe("RecentRssSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("로딩 중이면 스켈레톤을 렌더링해야 한다", () => {
    useRecentRssMock.mockReturnValue({ data: undefined, isLoading: true });
    renderSection();

    expect(screen.getByTestId("section-header")).toBeInTheDocument();
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });

  it("RSS 목록의 이름과 플랫폼을 렌더링해야 한다", () => {
    useRecentRssMock.mockReturnValue({
      data: [
        { id: 1, name: "블로그A", blogPlatform: "velog", lastPublishedAt: "2026-01-01T00:00:00.000Z" },
        { id: 2, name: "블로그B", blogPlatform: "tistory", lastPublishedAt: "2026-01-02T00:00:00.000Z" },
      ],
      isLoading: false,
    });
    renderSection();

    expect(screen.getByText("블로그A")).toBeInTheDocument();
    expect(screen.getByText("velog")).toBeInTheDocument();
    expect(screen.getByText("블로그B")).toBeInTheDocument();
    expect(screen.getByText("tistory")).toBeInTheDocument();
  });

  it("RSS 클릭 시 RSS 페이지로 이동하는 링크를 가져야 한다", () => {
    useRecentRssMock.mockReturnValue({
      data: [{ id: 7, name: "블로그A", blogPlatform: "velog", lastPublishedAt: "2026-01-01T00:00:00.000Z" }],
      isLoading: false,
    });
    renderSection();

    expect(screen.getByRole("link")).toHaveAttribute("href", "/rss/7");
  });

  it("목록이 비어 있으면 아무것도 렌더링하지 않아야 한다", () => {
    useRecentRssMock.mockReturnValue({ data: [], isLoading: false });
    const { container } = renderSection();

    expect(container).toBeEmptyDOMElement();
  });

  it("플랫폼별 뱃지 색상을 적용하고 미지정 플랫폼은 기본 색상을 사용해야 한다", () => {
    useRecentRssMock.mockReturnValue({
      data: [
        { id: 1, name: "블로그A", blogPlatform: "tistory", lastPublishedAt: "2026-01-01T00:00:00.000Z" },
        { id: 2, name: "블로그B", blogPlatform: "velog", lastPublishedAt: "2026-01-02T00:00:00.000Z" },
        { id: 3, name: "블로그C", blogPlatform: "github", lastPublishedAt: "2026-01-03T00:00:00.000Z" },
        { id: 4, name: "블로그D", blogPlatform: "etc", lastPublishedAt: "2026-01-04T00:00:00.000Z" },
      ],
      isLoading: false,
    });
    renderSection();

    expect(screen.getByText("tistory")).toHaveStyle({ backgroundColor: "#EB531F" });
    expect(screen.getByText("velog")).toHaveStyle({ backgroundColor: "#20C997" });
    expect(screen.getByText("github")).toHaveStyle({ backgroundColor: "#000000" });
    expect(screen.getByText("etc")).toHaveStyle({ backgroundColor: "#6B7280" });
  });

  it("10개일 때는 justify-between으로, 미만이면 왼쪽 정렬로 배치해야 한다", () => {
    const makeRss = (id: number) => ({
      id,
      name: `블로그${id}`,
      blogPlatform: "velog",
      lastPublishedAt: "2026-01-01T00:00:00.000Z",
    });

    useRecentRssMock.mockReturnValue({
      data: Array.from({ length: 10 }, (_, i) => makeRss(i + 1)),
      isLoading: false,
    });
    const { unmount } = renderSection();
    expect(screen.getByRole("list")).toHaveClass("justify-between");
    unmount();

    useRecentRssMock.mockReturnValue({
      data: Array.from({ length: 4 }, (_, i) => makeRss(i + 1)),
      isLoading: false,
    });
    renderSection();
    expect(screen.getByRole("list")).not.toHaveClass("justify-between");
    expect(screen.getByRole("list")).toHaveClass("gap-6");
  });
});
