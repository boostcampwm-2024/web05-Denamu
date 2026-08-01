import type { ReactNode } from "react";

import { describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { RssFeedCard } from "@/components/profile/rss/RssFeedCard.tsx";

import { render, screen } from "@testing-library/react";

vi.mock("lucide-react", () => lucideProxy());

vi.mock("react-router-dom", () => ({
  Link: ({ to, children, ...props }: { to: string; children: ReactNode }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

describe("RssFeedCard", () => {
  const props = {
    id: 7,
    title: "테스트 게시글",
    thumbnail: "https://cdn.test/thumb.png",
    createdAt: "2025-01-15T00:00:00Z",
    commentCount: 4,
    likeCount: 9,
  };

  it("썸네일, 제목, 좋아요/댓글 수를 렌더링하고 게시글로 연결해야 한다", () => {
    render(<RssFeedCard {...props} />);

    expect(screen.getByRole("img", { name: "테스트 게시글" })).toHaveAttribute(
      "src",
      "https://cdn.test/thumb.png"
    );
    expect(screen.getByText("테스트 게시글")).toBeInTheDocument();
    expect(screen.getByText("9")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/7");
  });
});
