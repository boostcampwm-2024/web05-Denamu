import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import AdminPostTab from "@/components/admin/post/AdminPostTab.tsx";

import { fireEvent, render, screen } from "@testing-library/react";

const batchRequest = vi.fn();
const mockToast = vi.fn();
let noSummaryFeeds: Array<{ id: number; title: string; likes: number; comments: number }>;
let infiniteItems: Array<{ id: number; title: string; thumbnail: string }>;
let searchData: { data: { result: Array<{ id: number; title: string }>; totalCount: number } };

vi.mock("lucide-react", () => lucideProxy());

vi.mock("@/hooks/common/useCustomToast", () => ({ useCustomToast: () => ({ toast: mockToast }) }));
vi.mock("@/hooks/queries/useAiSummaryRequest", () => ({
  NO_SUMMARY_FEEDS_KEY: ["no-summary"],
  useNoSummaryFeeds: () => ({ data: noSummaryFeeds, isLoading: false }),
  useBatchRequestAiSummary: () => ({ mutate: batchRequest, isPending: false }),
}));
vi.mock("@/hooks/queries/useSearch", () => ({
  useSearch: () => ({ data: searchData, isLoading: false }),
}));
vi.mock("@/hooks/queries/useInfiniteScrollQuery", () => ({
  useInfiniteScrollQuery: () => ({
    items: infiniteItems,
    isLoading: false,
    isFetchingNextPage: false,
    hasNextPage: false,
    fetchNextPage: vi.fn(),
  }),
}));
vi.mock("@/api/services/posts", () => ({ posts: { latest: vi.fn() } }));
vi.mock("@tanstack/react-query", () => ({ useQueryClient: () => ({ invalidateQueries: vi.fn() }) }));

vi.mock("@/components/common/Card/PostCardContent", () => ({
  PostCardContent: ({ post }: { post: { title: string } }) => <div>{post.title}</div>,
}));
vi.mock("@/components/common/Card/PostCardImage", () => ({ PostCardImage: () => <div /> }));
vi.mock("@/components/common/Card/PostCardSkeleton", () => ({ PostGridSkeleton: () => <div data-testid="skeleton" /> }));
vi.mock("@/components/admin/post/AdminPostDetail", () => ({ default: () => <div data-testid="post-detail" /> }));

describe("AdminPostTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    noSummaryFeeds = [];
    infiniteItems = [{ id: 1, title: "전체 게시글1", thumbnail: "t" }];
    searchData = { data: { result: [], totalCount: 0 } };
  });

  it("AI 요약 없는 게시글 섹션과 전체 게시글을 렌더링해야 한다", () => {
    render(<AdminPostTab />);

    expect(screen.getByText(/AI 요약 없는 게시글/)).toBeInTheDocument();
    expect(screen.getByText("전체 게시글")).toBeInTheDocument();
    expect(screen.getByText("전체 게시글1")).toBeInTheDocument();
  });

  it("AI 요약 없는 게시글이 없으면 안내 문구를 표시해야 한다", () => {
    render(<AdminPostTab />);

    expect(screen.getByText("AI 요약이 없는 게시글이 없습니다.")).toBeInTheDocument();
  });

  it("요약 없는 게시글이 있으면 목록을 렌더링하고 선택/일괄요청이 가능해야 한다", () => {
    noSummaryFeeds = [{ id: 10, title: "요약없는글", likes: 1, comments: 0 }];
    render(<AdminPostTab />);

    expect(screen.getByText("요약없는글")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "선택" }));
    fireEvent.click(screen.getByRole("button", { name: /AI 요약 재요청/ }));

    expect(batchRequest).toHaveBeenCalledWith([10], expect.any(Object));
  });

  it("제목 검색 시 '검색 결과' 헤더로 전환되어야 한다", () => {
    render(<AdminPostTab />);

    const searchInputs = screen.getAllByPlaceholderText("제목으로 게시글 검색");
    fireEvent.change(searchInputs[1], { target: { value: "리액트" } });

    expect(screen.getByText(/검색 결과 \(/)).toBeInTheDocument();
  });

  it("검색 결과가 있으면 결과 카드를 렌더링해야 한다", () => {
    searchData = { data: { result: [{ id: 5, title: "검색된 글" }], totalCount: 1 } };
    render(<AdminPostTab />);

    const searchInputs = screen.getAllByPlaceholderText("제목으로 게시글 검색");
    fireEvent.change(searchInputs[1], { target: { value: "검색" } });

    expect(screen.getByText("검색된 글")).toBeInTheDocument();
    expect(screen.getByText(/검색 결과 \(1\)/)).toBeInTheDocument();
  });

  it("전체 선택 후 일괄 요청 성공 시 toast 를 띄운다", () => {
    noSummaryFeeds = [
      { id: 10, title: "글A", likes: 0, comments: 0 },
      { id: 11, title: "글B", likes: 0, comments: 0 },
    ];
    batchRequest.mockImplementation((_ids, opts) => opts.onSuccess({ success: 2, failed: 0 }));
    render(<AdminPostTab />);

    fireEvent.click(screen.getByRole("button", { name: /전체 선택/ }));
    fireEvent.click(screen.getByRole("button", { name: /AI 요약 재요청/ }));

    expect(batchRequest).toHaveBeenCalledWith([10, 11], expect.any(Object));
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: "AI 요약 재요청 접수" }));
  });

  it("게시글 카드를 클릭하면 상세(AdminPostDetail)가 열린다", () => {
    render(<AdminPostTab />);

    expect(screen.queryByTestId("post-detail")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("전체 게시글1").closest('[role="button"]')!);

    expect(screen.getByTestId("post-detail")).toBeInTheDocument();
  });
});
