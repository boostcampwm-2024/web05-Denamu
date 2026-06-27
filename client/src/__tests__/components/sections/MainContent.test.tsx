import { beforeEach, describe, expect, it, vi } from "vitest";

import MainContent from "@/components/sections/MainContent.tsx";

import { render, screen } from "@testing-library/react";

const isMobileMock = vi.fn(() => false);

vi.mock("@/store/useMediaStore", () => ({
  useMediaStore: (selector: (s: { isMobile: boolean }) => unknown) => selector({ isMobile: isMobileMock() }),
}));

vi.mock("@/components/sections/TrendingSection", () => ({
  default: () => <div data-testid="trending-section" />,
}));

vi.mock("@/components/sections/LatestSection", () => ({
  default: () => <div data-testid="latest-section" />,
}));

describe("MainContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isMobileMock.mockReturnValue(false);
  });

  it("Trending/Latest 섹션을 렌더링하고 mount 시 scrollTo(0,0)을 호출해야 한다", () => {
    const scrollSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    render(<MainContent />);

    expect(screen.getByTestId("trending-section")).toBeInTheDocument();
    expect(screen.getByTestId("latest-section")).toBeInTheDocument();
    expect(scrollSpy).toHaveBeenCalledWith(0, 0);
    scrollSpy.mockRestore();
  });

  it("데스크톱에서는 구분선(hr)이 없어야 한다", () => {
    const { container } = render(<MainContent />);

    expect(container.querySelector("hr")).not.toBeInTheDocument();
  });

  it("모바일에서는 구분선(hr)이 렌더링되어야 한다", () => {
    isMobileMock.mockReturnValue(true);
    const { container } = render(<MainContent />);

    expect(container.querySelector("hr")).toBeInTheDocument();
  });
});
