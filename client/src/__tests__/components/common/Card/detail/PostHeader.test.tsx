import { describe, expect, it } from "vitest";

import { PostHeader } from "@/components/common/Card/detail/PostHeader.tsx";

import { FeedDetail } from "@/types/post.ts";
import { render, screen } from "@testing-library/react";

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
});
