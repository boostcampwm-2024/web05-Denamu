import { beforeEach, describe, expect, it, vi } from "vitest";

import PostComment from "@/components/common/Card/detail/PostComment.tsx";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { FeedCommentType } from "@/types/post.ts";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const createComment = vi.fn();
const updateComment = vi.fn();
const deleteComment = vi.fn();
const mockBlockUser = vi.fn().mockResolvedValue(undefined);
const mockReportComment = vi.fn((_vars: unknown, options?: { onSuccess?: () => void; onError?: () => void }) =>
  options?.onSuccess?.()
);
let isAuthenticated: boolean;
let comments: FeedCommentType[];

vi.mock("@/store/useAuthStore", () => ({
  useAuthStore: (selector: (s: { userInfo: { id: number; userName: string }; isAuthenticated: boolean }) => unknown) =>
    selector({ userInfo: { id: 1, userName: "민석" }, isAuthenticated }),
}));

vi.mock("@/hooks/queries/useComments", () => ({
  useComments: () => ({ data: comments }),
  useCreateComment: () => ({ mutate: createComment, isPending: false }),
  useUpdateComment: () => ({ mutate: updateComment }),
  useDeleteComment: () => ({ mutate: deleteComment }),
  useAdminDeleteComment: () => ({ mutate: vi.fn() }),
}));

vi.mock("@/hooks/queries/useProfile", () => ({ useUserProfile: () => ({ data: undefined }) }));
vi.mock("@/hooks/queries/useReport", () => ({
  useReportComment: () => ({ mutate: mockReportComment, isPending: false }),
}));
vi.mock("@/hooks/queries/useBlock", () => ({
  useBlockUser: () => ({ mutateAsync: mockBlockUser }),
}));
vi.mock("@/hooks/common/useNavigateToProfile", () => ({ useNavigateToProfile: () => vi.fn() }));
vi.mock("@/utils/timeago", () => ({ timeAgo: () => "방금 전" }));
vi.mock("@/components/auth/AuthSignInForm", () => ({ AuthSignInForm: () => <div data-testid="signin-form" /> }));
vi.mock("lucide-react", () => lucideProxy());
vi.mock("@/components/ui/select", () => {
  const pass = ({ children }: { children: React.ReactNode }) => <>{children}</>;
  return {
    Select: ({ children, onValueChange }: { children: React.ReactNode; onValueChange: (value: string) => void }) => (
      <div
        onClick={(event) => {
          const value = (event.target as HTMLElement).getAttribute("data-value");
          if (value) onValueChange(value);
        }}
      >
        {children}
      </div>
    ),
    SelectContent: pass,
    SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
      <div role="option" data-value={value}>
        {children}
      </div>
    ),
    SelectTrigger: pass,
    SelectValue: () => null,
  };
});

const makeComment = (id: number, override: Partial<FeedCommentType> = {}): FeedCommentType =>
  ({
    id,
    parentId: null,
    comment: `댓글 ${id}`,
    date: `2024-03-2${id}T00:00:00Z`,
    isDeleted: false,
    user: { id: 1, userName: "민석", profileImage: null },
    ...override,
  }) as FeedCommentType;

describe("PostComment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isAuthenticated = true;
    comments = [makeComment(1), makeComment(2)];
  });

  it("댓글 개수와 목록, 작성시간을 렌더링해야 한다", () => {
    render(<PostComment feedId={10} />);

    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("댓글 1")).toBeInTheDocument();
    expect(screen.getAllByText("방금 전").length).toBeGreaterThan(0);
  });

  it("인증 상태에서 댓글 입력 후 등록 시 createComment를 호출해야 한다", () => {
    render(<PostComment feedId={10} />);

    fireEvent.change(screen.getByPlaceholderText("댓글을 입력하세요..."), { target: { value: "새 댓글" } });
    fireEvent.click(screen.getByRole("button", { name: "등록" }));

    expect(createComment).toHaveBeenCalledWith({ comment: "새 댓글" }, expect.any(Object));
  });

  it("빈 댓글은 등록되지 않아야 한다", () => {
    render(<PostComment feedId={10} />);

    fireEvent.click(screen.getByRole("button", { name: "등록" }));

    expect(createComment).not.toHaveBeenCalled();
  });

  it("비인증 상태에서 등록 시 createComment 대신 로그인 폼이 열려야 한다", () => {
    isAuthenticated = false;
    render(<PostComment feedId={10} />);

    fireEvent.change(screen.getByPlaceholderText("댓글을 입력하세요..."), { target: { value: "댓글" } });
    fireEvent.click(screen.getByRole("button", { name: "등록" }));

    expect(createComment).not.toHaveBeenCalled();
  });

  it("내 댓글은 수정 버튼이 있고, 수정 후 저장 시 updateComment를 호출해야 한다", () => {
    comments = [makeComment(1)];
    render(<PostComment feedId={10} />);

    fireEvent.click(screen.getByRole("button", { name: "수정" }));
    const editArea = screen.getByDisplayValue("댓글 1");
    fireEvent.change(editArea, { target: { value: "수정된 댓글" } });
    fireEvent.click(screen.getByRole("button", { name: "댓글 수정" }));

    expect(updateComment).toHaveBeenCalledWith({ commentId: 1, newComment: "수정된 댓글" }, expect.any(Object));
  });

  it("답글 버튼 클릭 후 답글 작성 시 parentId와 함께 createComment를 호출해야 한다", () => {
    comments = [makeComment(1)];
    render(<PostComment feedId={10} />);

    fireEvent.click(screen.getByRole("button", { name: "답글" }));
    fireEvent.change(screen.getByPlaceholderText("답글을 입력하세요..."), { target: { value: "답글 내용" } });
    fireEvent.click(screen.getByRole("button", { name: "답글 등록" }));

    expect(createComment).toHaveBeenCalledWith({ comment: "답글 내용", parentId: 1 }, expect.any(Object));
  });

  it("대댓글(parentId)이 있으면 기본적으로 숨겨지고 답글 개수가 표시되며, 클릭하면 펼쳐진다", () => {
    comments = [makeComment(1), makeComment(3, { parentId: 1, comment: "대댓글" })];
    render(<PostComment feedId={10} />);

    expect(screen.queryByText("대댓글")).not.toBeInTheDocument();
    const toggleBtn = screen.getByRole("button", { name: /답글 1개/ });
    expect(toggleBtn).toBeInTheDocument();

    fireEvent.click(toggleBtn);

    expect(screen.getByText("대댓글")).toBeInTheDocument();
  });

  it("삭제된 댓글은 fallback 표시를 사용해야 한다", () => {
    comments = [makeComment(1, { isDeleted: true, comment: "삭제됨" })];
    render(<PostComment feedId={10} />);

    expect(screen.getByText("?")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "수정" })).not.toBeInTheDocument();
  });

  it("루트 댓글이 3개를 초과하면 '댓글 더보기' 버튼을 표시하고 클릭 시 전체를 보여준다", () => {
    comments = [makeComment(1), makeComment(2), makeComment(3), makeComment(4)];
    render(<PostComment feedId={10} />);

    const moreBtn = screen.getByRole("button", { name: "댓글 더보기" });
    fireEvent.click(moreBtn);

    expect(screen.queryByRole("button", { name: "댓글 더보기" })).not.toBeInTheDocument();
  });

  it("highlightCommentId로 지정된 댓글로 스크롤 이동한다", () => {
    comments = [makeComment(1), makeComment(2)];
    render(<PostComment feedId={10} highlightCommentId={2} />);

    const target = document.getElementById("comment-2");
    expect(target).not.toBeNull();
    expect(target?.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "center" });
  });

  it("댓글이 마운트 이후(react-query 로딩 완료 후) 도착해도 스크롤 이동한다", () => {
    comments = [];
    const { rerender } = render(<PostComment feedId={10} highlightCommentId={2} />);

    expect(document.getElementById("comment-2")).toBeNull();

    comments = [makeComment(1), makeComment(2)];
    rerender(<PostComment feedId={10} highlightCommentId={2} />);

    const target = document.getElementById("comment-2");
    expect(target).not.toBeNull();
    expect(target?.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "center" });
  });

  it("highlightCommentId 댓글이 초기 노출 범위(3개) 밖이면 자동으로 '더보기'를 펼친다", () => {
    // makeComment는 날짜 오름차순(id 1이 가장 오래됨)이고 목록은 최신순 정렬이라
    // id 1(가장 오래된 루트)이 4개 중 노출 범위(3개) 밖으로 밀려난다.
    comments = [makeComment(1), makeComment(2), makeComment(3), makeComment(4)];
    render(<PostComment feedId={10} highlightCommentId={1} />);

    expect(screen.queryByRole("button", { name: "댓글 더보기" })).not.toBeInTheDocument();
    expect(document.getElementById("comment-1")).not.toBeNull();
  });

  it("highlightCommentId가 대댓글이면 그 부모 위치 기준으로 노출 범위를 펼친다", () => {
    comments = [
      makeComment(1),
      makeComment(2),
      makeComment(3),
      makeComment(4),
      makeComment(5, { parentId: 1, comment: "대댓글" }),
    ];
    render(<PostComment feedId={10} highlightCommentId={5} />);

    expect(screen.queryByRole("button", { name: "댓글 더보기" })).not.toBeInTheDocument();
    expect(document.getElementById("comment-5")).not.toBeNull();
  });

  const openReportModal = async () => {
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "댓글 옵션" }));
    await user.click(await screen.findByText("신고하기"));
    return user;
  };

  it("함께 차단하기 스위치를 켜지 않으면 댓글만 신고해야 한다", async () => {
    comments = [makeComment(1, { user: { id: 2, userName: "타인", profileImage: null } })];
    render(<PostComment feedId={10} />);

    const user = await openReportModal();
    await user.click(screen.getByText("스팸/광고"));
    await user.click(screen.getByRole("button", { name: "신고하기" }));

    expect(mockReportComment).toHaveBeenCalledWith(
      { commentId: 1, payload: { reason: "SPAM", detail: undefined } },
      expect.anything()
    );
    expect(mockBlockUser).not.toHaveBeenCalled();
  });

  it("함께 차단하기 스위치를 켜면 댓글 신고 후 작성자를 차단해야 한다", async () => {
    comments = [makeComment(1, { user: { id: 2, userName: "타인", profileImage: null } })];
    render(<PostComment feedId={10} />);

    const user = await openReportModal();
    await user.click(screen.getByText("스팸/광고"));
    await user.click(screen.getByRole("switch"));
    await user.click(screen.getByRole("button", { name: "신고하기" }));

    await waitFor(() => expect(mockBlockUser).toHaveBeenCalledWith(2));
  });
});
