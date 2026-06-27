import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { CommentList } from "@/components/profile/CommentList.tsx";

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

let state: {
  data: { pages: Array<{ result: Array<{ id: number; comment: string; date: string; feed: { id: number; title: string } }> }> } | undefined;
  isLoading: boolean;
  isError: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
};

vi.mock("lucide-react", () => lucideProxy());

vi.mock("@/hooks/queries/useProfile.ts", () => ({ useUserComments: () => state }));

const renderList = () =>
  render(
    <MemoryRouter>
      <CommentList userId={1} />
    </MemoryRouter>
  );

describe("CommentList", () => {
  beforeEach(() => {
    state = {
      data: { pages: [{ result: [] }] },
      isLoading: false,
      isError: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
      isFetchingNextPage: false,
    };
  });

  it("로딩 중이면 안내 문구를 표시해야 한다", () => {
    state.isLoading = true;
    renderList();

    expect(screen.getByText("불러오는 중...")).toBeInTheDocument();
  });

  it("댓글이 없으면 빈 안내를 표시해야 한다", () => {
    renderList();

    expect(screen.getByText("작성한 댓글이 없습니다.")).toBeInTheDocument();
  });

  it("댓글 목록을 렌더링하고 피드 링크를 연결해야 한다", () => {
    state.data = {
      pages: [{ result: [{ id: 1, comment: "좋은 글이네요", date: "2024-03-26", feed: { id: 9, title: "원본 글" } }] }],
    };
    renderList();

    expect(screen.getByText("좋은 글이네요")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "원본 글" })).toHaveAttribute("href", "/9");
  });
});
