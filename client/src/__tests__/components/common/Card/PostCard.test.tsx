import { describe, it, expect, vi } from "vitest";

import { PostCard } from "@/components/common/Card/PostCard";

import * as PostCardActions from "@/hooks/common/usePostCardActions";

import { createLongTitlePost, createMinimalPost, createMockPost } from "@/__tests__/mocks/data/posts.ts";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("@/hooks/common/usePostCardActions", () => ({
  usePostCardActions: vi.fn(() => ({
    handlePostClick: vi.fn(),
  })),
}));

describe("PostCard", () => {
  it("PostCard가 올바른 내용으로 렌더링되는지 확인", () => {
    render(<PostCard post={createMockPost()} />);

    const card = screen.getByRole("button");
    expect(card).toBeInTheDocument();
    expect(screen.getByText("테스트 포스트")).toBeInTheDocument();
  });

  it("custom className이 제공되었을 때 적용되는지 확인", () => {
    const customClass = "custom-test-class";
    render(<PostCard post={createMinimalPost()} className={customClass} />);

    const card = screen.getByRole("button");
    expect(card).toHaveClass(customClass);
  });

  it("카드 클릭 시 handlePostClick이 호출되는지 확인", () => {
    const mockHandlePostClick = vi.fn();
    vi.mocked(PostCardActions.usePostCardActions).mockReturnValue({
      incrementView: mockHandlePostClick,
      openPost: vi.fn(),
    });

    render(<PostCard post={createLongTitlePost()} />);

    const card = screen.getByRole("button");
    fireEvent.click(card);

    expect(mockHandlePostClick).toHaveBeenCalled();
  });

  it("모든 필수 필드가 렌더링되는지 확인", () => {
    render(<PostCard post={createMockPost()} />);

    expect(screen.getByText("테스트 포스트")).toBeInTheDocument();
    expect(screen.getByText("작성자")).toBeInTheDocument();
    expect(screen.getByText(/2024년 3월 26일/)).toBeInTheDocument();
  });

  it("optional 필드가 없을 때도 정상 렌더링되는지 확인", () => {
    const minimalPost = {
      id: 1,
      createdAt: "2024-03-26T00:00:00Z",
      title: "테스트 포스트",
      viewCount: 100,
      path: "/test-post",
      author: "작성자",
      thumbnail: "",
      blogPlatform: "etc",
      tag: ["JavaScript", "React"],
      summary: "# test",
    };

    render(<PostCard post={minimalPost} />);
    expect(screen.getByText("테스트 포스트")).toBeInTheDocument();
  });

  it("긴 제목이 ellipsis 처리되는지 확인", () => {
    const longTitlePost = {
      ...createMockPost(),
      title: "아주 긴 제목".repeat(20),
    };

    render(<PostCard post={longTitlePost} />);
    const titleElement = screen.getByText(/아주 긴 제목/);
    expect(titleElement).toHaveClass("line-clamp-2");
  });
});
