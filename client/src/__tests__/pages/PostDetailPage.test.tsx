import { beforeEach, describe, expect, it, vi } from "vitest";

import { render, screen } from "@testing-library/react";

const mockIncrement = vi.fn();
let params: { id?: string };
let detailState: {
  data: { data: { title: string; isBlocked?: boolean } } | undefined;
  isLoading: boolean;
  error: unknown;
};

vi.mock("lucide-react", async () => {
  const { lucideProxy } = await import("@/__tests__/__mocks__/external/lucide-proxy.tsx");
  return lucideProxy();
});

vi.mock("react-router-dom", () => ({
  useParams: () => params,
  useLocation: () => ({ state: null }),
}));

vi.mock("@/hooks/queries/usePostDetail", () => ({
  usePostDetail: () => detailState,
}));

vi.mock("@/hooks/common/usePostCardActions", () => ({
  useIncrementViewByPostId: () => mockIncrement,
}));

vi.mock("@/components/layout/Header", () => ({ default: () => <div data-testid="header" /> }));
vi.mock("@/pages/Loading", () => ({ default: () => <div data-testid="loading" /> }));
vi.mock("@/pages/NotFound", () => ({ default: () => <div data-testid="not-found" /> }));
vi.mock("@/components/common/Card/detail/PostHeader", () => ({
  PostHeader: ({ data }: { data: { title: string } }) => <div data-testid="post-header">{data.title}</div>,
}));
vi.mock("@/components/common/Card/detail/PostContent", () => ({
  PostContent: () => <div data-testid="post-content" />,
}));

import PostDetailPage from "@/pages/PostDetailPage.tsx";

describe("PostDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    params = { id: "1" };
    detailState = { data: { data: { title: "상세 제목" } }, isLoading: false, error: null };
  });

  it("id가 숫자가 아니면 NotFound를 렌더링해야 한다", () => {
    params = { id: "abc" };
    render(<PostDetailPage />);

    expect(screen.getByTestId("not-found")).toBeInTheDocument();
  });

  it("로딩 중이면 Loading을 렌더링해야 한다", () => {
    detailState = { data: undefined, isLoading: true, error: null };
    render(<PostDetailPage />);

    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("정상 data면 PostHeader와 PostContent를 렌더링해야 한다", () => {
    render(<PostDetailPage />);

    expect(screen.getByTestId("post-header")).toHaveTextContent("상세 제목");
    expect(screen.getByTestId("post-content")).toBeInTheDocument();
  });

  it("차단된 RSS의 게시글이면 차단 안내를 렌더링하고 본문은 숨겨야 한다", () => {
    detailState = { data: { data: { title: "상세 제목", isBlocked: true } }, isLoading: false, error: null };
    render(<PostDetailPage />);

    expect(screen.getByText("차단된 RSS의 게시글입니다.")).toBeInTheDocument();
    expect(screen.queryByTestId("post-header")).not.toBeInTheDocument();
    expect(screen.queryByTestId("post-content")).not.toBeInTheDocument();
  });
});
