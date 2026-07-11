import { beforeEach, describe, expect, it, vi } from "vitest";

import LatestSection from "@/components/sections/LatestSection.tsx";

import { fireEvent, render, screen } from "@testing-library/react";

const navigate = vi.fn();

let filterState: { filters: string[]; removeAll: () => void };
let postType: "latest" | "recommend" | "subscribe";
let isAuthenticated: boolean;

vi.mock("react-router-dom", () => ({
  useNavigate: () => navigate,
}));

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

vi.mock("@/store/useAuthStore", () => ({
  useAuthStore: (selector: (s: { isAuthenticated: boolean }) => unknown) => selector({ isAuthenticated }),
}));

vi.mock("@/hooks/common/useRecentTag", () => ({ useRecentTag: () => [] }));

vi.mock("@/components/common/SectionHeader", () => ({
  SectionHeader: ({ text }: { text: string }) => <div>{text}</div>,
}));

vi.mock("@/components/filter/Filter", () => ({ default: () => <div data-testid="filter" /> }));

vi.mock("@/components/sections/LatestSectionTimer", () => ({ default: () => <div data-testid="timer" /> }));

vi.mock("@/components/sections/LatestFeedList", () => ({
  default: ({ tags }: { tags: string[] }) => <div data-testid="latest-feed" data-tags={tags.join(",")} />,
}));

vi.mock("@/components/sections/SubscriptionFeedList", () => ({
  default: () => <div data-testid="subscription-feed" />,
}));

describe("LatestSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    filterState = { filters: [], removeAll: vi.fn() };
    postType = "latest";
    isAuthenticated = false;
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

  it("postType이 subscribe가 아니면 LatestFeedList를 렌더링해야 한다", () => {
    filterState.filters = ["React"];
    render(<LatestSection />);

    expect(screen.getByTestId("latest-feed")).toHaveAttribute("data-tags", "React");
  });

  it("postType이 subscribe이고 인증된 경우 SubscriptionFeedList를 렌더링해야 한다", () => {
    postType = "subscribe";
    isAuthenticated = true;
    render(<LatestSection />);

    expect(screen.getByTestId("subscription-feed")).toBeInTheDocument();
  });

  it("postType이 subscribe이고 비인증인 경우 로그인 프롬프트를 렌더링해야 한다", () => {
    postType = "subscribe";
    isAuthenticated = false;
    render(<LatestSection />);

    expect(screen.queryByTestId("subscription-feed")).not.toBeInTheDocument();
    expect(screen.getByText("로그인이 필요한 기능입니다")).toBeInTheDocument();
  });

  it("로그인 프롬프트 버튼 클릭 시 signin으로 이동해야 한다", () => {
    postType = "subscribe";
    isAuthenticated = false;
    render(<LatestSection />);

    fireEvent.click(screen.getByText("로그인 하러가기"));

    expect(navigate).toHaveBeenCalledWith("/signin");
  });
});
