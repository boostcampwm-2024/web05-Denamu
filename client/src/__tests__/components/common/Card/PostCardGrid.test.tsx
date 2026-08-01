import { describe, it, expect } from "vitest";

import { PostCardGrid } from "@/components/common/Card/PostCardGrid.tsx";

import { createMockPosts } from "@/__tests__/mocks/data/posts.ts";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

describe("PostCardGrid", () => {
  it("정상적인 개수의 PostCard가 렌더링 되어야 한다", () => {
    const mockPosts = createMockPosts(3);
    render(<MemoryRouter><PostCardGrid posts={mockPosts} /></MemoryRouter>);

    const postTitles = screen.getAllByText("테스트 포스트");
    expect(postTitles).toHaveLength(3);

    const clickableCards = screen.getAllByRole("button");
    expect(clickableCards).toHaveLength(3);
  });

  it("responsive grid class가 정상적으로 적용되어야 한다", () => {
    const mockPosts = createMockPosts(1);
    const { container } = render(<MemoryRouter><PostCardGrid posts={mockPosts} /></MemoryRouter>);

    const gridContainer = container.firstChild;
    expect(gridContainer).toHaveClass(
      "grid",
      "grid-cols-1",
      "md:grid-cols-2",
      "lg:grid-cols-3",
      "xl:grid-cols-4",
      "gap-6"
    );
  });

  it("빈 배열이 전달되면 empty grid가 렌더링 되어야 한다", () => {
    render(<MemoryRouter><PostCardGrid posts={[]} /></MemoryRouter>);

    const cards = screen.queryAllByRole("button");
    expect(cards).toHaveLength(0);
  });
});
