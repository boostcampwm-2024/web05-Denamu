import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import AdminPostDetail from "@/components/admin/post/AdminPostDetail.tsx";

import { fireEvent, render, screen } from "@testing-library/react";

const requestSummary = vi.fn();
let detail: { data: { id: number; title: string; summary?: string; likes: number; comments: number } } | undefined;

vi.mock("lucide-react", () => lucideProxy());

vi.mock("react-markdown", () => ({ default: ({ children }: { children: string }) => <div>{children}</div> }));

vi.mock("@/hooks/queries/usePostDetail", () => ({ usePostDetail: () => ({ data: detail }) }));
vi.mock("@/hooks/common/useCustomToast", () => ({ useCustomToast: () => ({ toast: vi.fn() }) }));
vi.mock("@/hooks/queries/useAiSummaryRequest", () => ({
  NO_SUMMARY_FEEDS_KEY: ["no-summary"],
  useRequestAiSummary: () => ({ mutate: requestSummary, isPending: false }),
}));
vi.mock("@tanstack/react-query", () => ({ useQueryClient: () => ({ invalidateQueries: vi.fn() }) }));

vi.mock("@/components/common/Card/detail/PostHeader", () => ({
  PostHeader: ({ data }: { data: { title: string } }) => <div data-testid="post-header">{data.title}</div>,
}));
vi.mock("@/components/common/Card/detail/PostComment", () => ({ default: () => <div data-testid="comment" /> }));

describe("AdminPostDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    detail = { data: { id: 7, title: "게시글 제목", summary: "요약", likes: 3, comments: 2 } };
  });

  it("data가 없으면 null을 렌더링해야 한다", () => {
    detail = undefined;
    const { container } = render(<AdminPostDetail feedId={7} onClose={vi.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("제목과 공감/댓글 수를 렌더링해야 한다", () => {
    render(<AdminPostDetail feedId={7} onClose={vi.fn()} />);

    expect(screen.getByTestId("post-header")).toHaveTextContent("게시글 제목");
    expect(screen.getByText(/공감 3/)).toBeInTheDocument();
    expect(screen.getByText(/댓글 2/)).toBeInTheDocument();
  });

  it("AI 요약 재시도 클릭 시 requestSummary(post.id)를 호출해야 한다", () => {
    render(<AdminPostDetail feedId={7} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /AI 요약 재시도/ }));

    expect(requestSummary).toHaveBeenCalledWith(7, expect.any(Object));
  });

  it("닫기 버튼 클릭 시 onClose를 호출해야 한다", () => {
    const onClose = vi.fn();
    render(<AdminPostDetail feedId={7} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: "Close modal" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("summary가 없으면 안내 문구를 표시해야 한다", () => {
    detail = { data: { id: 7, title: "제목", summary: "", likes: 0, comments: 0 } };
    render(<AdminPostDetail feedId={7} onClose={vi.fn()} />);

    expect(screen.getByText(/아직 AI 요약이 없습니다/)).toBeInTheDocument();
  });
});
