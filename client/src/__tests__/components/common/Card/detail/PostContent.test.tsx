import { beforeEach, describe, expect, it, vi } from "vitest";

import { PostContent } from "@/components/common/Card/detail/PostContent.tsx";

import { FeedDetail } from "@/types/post.ts";
import { fireEvent, render, screen } from "@testing-library/react";

const openPost = vi.fn();

vi.mock("react-markdown", () => ({
  default: ({ children }: { children: string }) => <div data-testid="markdown">{children}</div>,
}));

vi.mock("@/store/useMediaStore", () => ({
  useMediaStore: (selector: (s: { isMobile: boolean }) => unknown) => selector({ isMobile: false }),
}));

vi.mock("@/hooks/common/usePostCardActions", () => ({
  usePostCardActions: () => ({ openPost }),
}));

vi.mock("@/components/common/Card/detail/LikeButton", () => ({ default: () => <div data-testid="like" /> }));
vi.mock("@/components/common/Card/detail/ShareButton", () => ({ default: () => <div data-testid="share" /> }));
vi.mock("@/components/common/Card/detail/PostComment", () => ({ default: () => <div data-testid="comment" /> }));

const post = {
  id: 1,
  title: "본문 제목",
  path: "/post-path",
  blogPlatform: "velog",
  thumbnail: "thumb.jpg",
  summary: "요약 내용",
  isOwner: false,
} as unknown as FeedDetail;

describe("PostContent", () => {
  beforeEach(() => vi.clearAllMocks());

  it("제목과 경로, 좋아요/공유/댓글 영역을 렌더링해야 한다", () => {
    render(<PostContent post={post} />);

    expect(screen.getByText("본문 제목")).toBeInTheDocument();
    expect(screen.getByText("/post-path")).toBeInTheDocument();
    expect(screen.getByTestId("like")).toBeInTheDocument();
    expect(screen.getByTestId("share")).toBeInTheDocument();
    expect(screen.getByTestId("comment")).toBeInTheDocument();
  });

  it("원문 카드 클릭 시 openPost를 호출해야 한다", () => {
    render(<PostContent post={post} />);

    fireEvent.click(screen.getByRole("button"));

    expect(openPost).toHaveBeenCalledWith({ post });
  });

  it("summary가 있으면 AI 요약 안내 문구를 표시해야 한다", () => {
    render(<PostContent post={post} />);

    expect(screen.getByText(/인공지능이 요약한 내용입니다/)).toBeInTheDocument();
  });
});
