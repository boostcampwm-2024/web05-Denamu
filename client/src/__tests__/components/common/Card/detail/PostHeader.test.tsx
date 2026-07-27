import { MemoryRouter } from "react-router-dom";

import { describe, expect, it, vi } from "vitest";

import { PostHeader } from "@/components/common/Card/detail/PostHeader.tsx";

import { FeedDetail } from "@/types/post.ts";
import { render, screen } from "@testing-library/react";

vi.mock("@/components/common/Card/detail/SubscribeButton", () => ({
  SubscribeButton: () => <button>구독</button>,
}));

vi.mock("@/hooks/queries/useReport", () => ({
  useReportFeed: () => ({ mutate: vi.fn(), isPending: false }),
}));

const data = {
  id: 1,
  title: "상세 제목",
  author: "작성자",
  blogPlatform: "velog",
  createdAt: "2024-03-26T00:00:00Z",
  viewCount: 123,
  tag: ["React", "Test"],
  path: "/p",
  thumbnail: "",
  likes: 0,
  comments: 0,
} as unknown as FeedDetail;

describe("PostHeader", () => {
  it("제목, 작성자, 조회수를 렌더링해야 한다", () => {
    render(<PostHeader data={data} />);

    expect(screen.getByRole("heading", { name: "상세 제목" })).toBeInTheDocument();
    expect(screen.getByText("작성자")).toBeInTheDocument();
    expect(screen.getByText("123 views")).toBeInTheDocument();
  });

  it("태그 목록을 렌더링해야 한다", () => {
    render(<PostHeader data={data} />);

    expect(screen.getByText(/React/)).toBeInTheDocument();
    expect(screen.getByText(/Test/)).toBeInTheDocument();
  });

  it("blogId가 있으면 프로필 영역이 RSS 정보 페이지(/rss/:blogId)로 연결되어야 한다", () => {
    const withBlog = { ...data, blogId: 42, isOwner: false, isSubscribed: false } as unknown as FeedDetail;
    render(
      <MemoryRouter>
        <PostHeader data={withBlog} />
      </MemoryRouter>
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/rss/42");
    expect(link).toHaveTextContent("작성자");
  });

  it("blogId가 없으면 프로필 영역에 링크가 없어야 한다", () => {
    render(<PostHeader data={data} />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
