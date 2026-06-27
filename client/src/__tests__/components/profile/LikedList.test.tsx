import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { LikedList } from "@/components/profile/LikedList.tsx";

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

let state: {
  data: { pages: Array<{ result: Array<{ id: number; likeDate: string; feed: { id: number; title: string } }> }> } | undefined;
  isLoading: boolean;
  isError: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
};

vi.mock("lucide-react", () => lucideProxy());

vi.mock("@/hooks/queries/useProfile.ts", () => ({ useUserLikes: () => state }));

const renderList = () =>
  render(
    <MemoryRouter>
      <LikedList userId={1} />
    </MemoryRouter>
  );

describe("LikedList", () => {
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

  it("좋아요한 글이 없으면 빈 안내를 표시해야 한다", () => {
    renderList();

    expect(screen.getByText("좋아요한 게시글이 없습니다.")).toBeInTheDocument();
  });

  it("에러면 에러 문구를 표시해야 한다", () => {
    state.isError = true;
    renderList();

    expect(screen.getByText("목록을 불러오지 못했습니다.")).toBeInTheDocument();
  });

  it("좋아요한 게시글 목록을 렌더링하고 링크를 연결해야 한다", () => {
    state.data = { pages: [{ result: [{ id: 1, likeDate: "2024-03-26", feed: { id: 9, title: "좋아요 글" } }] }] };
    renderList();

    expect(screen.getByRole("link", { name: /좋아요 글/ })).toHaveAttribute("href", "/9");
  });
});
