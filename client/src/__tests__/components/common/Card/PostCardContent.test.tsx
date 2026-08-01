import { beforeEach, describe, expect, it, vi } from "vitest";

import { PostCardContent } from "@/components/common/Card/PostCardContent.tsx";

import { createMockPost } from "@/__tests__/mocks/data/posts.ts";
import { FeedList } from "@/types/post.ts";
import { render, screen } from "@testing-library/react";

const isMobileMock = vi.fn(() => false);

vi.mock("@/store/useMediaStore", () => ({
  useMediaStore: (selector: (s: { isMobile: boolean }) => unknown) => selector({ isMobile: isMobileMock() }),
}));

const post = createMockPost({ title: "제목입니다", blog: { name: "작성자명", platform: "etc" }, tag: ["React"] }) as FeedList;

describe("PostCardContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isMobileMock.mockReturnValue(false);
  });

  it("데스크톱에서 제목과 작성자를 렌더링해야 한다", () => {
    render(<PostCardContent post={post} />);

    expect(screen.getByText("제목입니다")).toBeInTheDocument();
    expect(screen.getByText("작성자명")).toBeInTheDocument();
  });

  it("모바일에서도 제목과 작성자를 렌더링해야 한다", () => {
    isMobileMock.mockReturnValue(true);
    render(<PostCardContent post={post} />);

    expect(screen.getByText("제목입니다")).toBeInTheDocument();
    expect(screen.getByText("작성자명")).toBeInTheDocument();
  });

  it("tag가 있으면 PostTag로 렌더링되어야 한다", () => {
    render(<PostCardContent post={post} />);

    expect(screen.getByText(/React/)).toBeInTheDocument();
  });
});
