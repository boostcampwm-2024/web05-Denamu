import { describe, expect, it, vi } from "vitest";

import AnimatedPostGrid from "@/components/sections/AnimatedPostGrid.tsx";

import { FeedList } from "@/types/post.ts";
import { render, screen } from "@testing-library/react";

vi.mock("@/hooks/common/usePositionTracking.ts", () => ({
  usePositionTracking: () => ({ hasPosition: () => false }),
}));

vi.mock("@/components/common/Card/PostCard", () => ({
  PostCard: ({ post }: { post: { id: number; title: string } }) => (
    <div data-testid="post-card">{post.title}</div>
  ),
}));

vi.mock("@/components/common/EmptyPost", () => ({
  default: () => <div data-testid="empty-post">게시글 없음</div>,
}));

const makePosts = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ id: i + 1, title: `포스트 ${i + 1}` })) as FeedList[];

describe("AnimatedPostGrid", () => {
  it("posts가 비어있으면 EmptyPost를 렌더링해야 한다", () => {
    render(<AnimatedPostGrid posts={[]} />);

    expect(screen.getByTestId("empty-post")).toBeInTheDocument();
    expect(screen.queryByTestId("post-card")).not.toBeInTheDocument();
  });

  it("posts 개수만큼 PostCard를 렌더링해야 한다", () => {
    render(<AnimatedPostGrid posts={makePosts(3)} />);

    expect(screen.getAllByTestId("post-card")).toHaveLength(3);
  });
});
