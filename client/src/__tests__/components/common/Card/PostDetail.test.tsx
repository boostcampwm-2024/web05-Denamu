import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import PostDetail from "@/components/common/Card/PostDetail.tsx";

import { fireEvent, render, screen } from "@testing-library/react";

const mockNavigate = vi.fn();
let params: { id?: string };
let detail: { data: { title: string; isBlocked?: boolean } } | undefined;
let isHeaderVisible: boolean;

vi.mock("lucide-react", () => lucideProxy());

vi.mock("react-router-dom", () => ({
  useParams: () => params,
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: null }),
}));

vi.mock("@/hooks/queries/usePostDetail", () => ({
  usePostDetail: () => ({ data: detail }),
}));

vi.mock("@/hooks/common/useScrollbarAdjustment", () => ({ useScrollbarAdjustment: () => 0 }));

vi.mock("@/hooks/common/useHeaderVisibility", () => ({
  useHeaderVisibility: () => ({ headerRef: { current: null }, isHeaderVisible }),
}));

vi.mock("@/pages/NotFound", () => ({ default: () => <div data-testid="not-found" /> }));
vi.mock("@/components/common/Card/detail/PostHeader", () => ({
  PostHeader: ({ data }: { data: { title: string } }) => <div data-testid="post-header">{data.title}</div>,
}));
vi.mock("@/components/common/Card/detail/PostContent", () => ({
  PostContent: () => <div data-testid="post-content" />,
}));
vi.mock("@/components/common/Card/detail/FixedHeader", () => ({
  FixedHeader: () => <div data-testid="fixed-header" />,
}));

describe("PostDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    params = { id: "1" };
    detail = { data: { title: "상세 제목" } };
    isHeaderVisible = true;
  });

  it("id가 숫자가 아니면 NotFound를 렌더링해야 한다", () => {
    params = { id: "abc" };
    render(<PostDetail />);

    expect(screen.getByTestId("not-found")).toBeInTheDocument();
  });

  it("data가 없으면 아무것도 렌더링하지 않아야 한다", () => {
    detail = undefined;
    const { container } = render(<PostDetail />);

    expect(container).toBeEmptyDOMElement();
  });

  it("정상 data면 PostHeader와 PostContent를 렌더링해야 한다", () => {
    render(<PostDetail />);

    expect(screen.getByTestId("post-header")).toHaveTextContent("상세 제목");
    expect(screen.getByTestId("post-content")).toBeInTheDocument();
  });

  it("닫기 버튼 클릭 시 navigate(-1)을 호출해야 한다", () => {
    render(<PostDetail />);

    fireEvent.click(screen.getByRole("button", { name: "Close modal" }));

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("헤더가 보이지 않으면 FixedHeader를 렌더링해야 한다", () => {
    isHeaderVisible = false;
    render(<PostDetail />);

    expect(screen.getByTestId("fixed-header")).toBeInTheDocument();
  });

  it("차단된 RSS의 게시글이면 차단 안내를 렌더링하고 본문은 숨겨야 한다", () => {
    detail = { data: { title: "상세 제목", isBlocked: true } };
    render(<PostDetail />);

    expect(screen.getByText("차단된 RSS의 게시글입니다.")).toBeInTheDocument();
    expect(screen.queryByTestId("post-header")).not.toBeInTheDocument();
    expect(screen.queryByTestId("post-content")).not.toBeInTheDocument();
  });
});
