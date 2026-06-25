import { describe, it, expect, vi } from "vitest";

import SearchResultItem from "@/components/search/SearchResults/SearchResultItem";

import { SearchResult } from "@/types/search.ts";
import { render, screen } from "@testing-library/react";

vi.mock("@/components/search/SearchHigilight", () => ({
  default: ({ text }: { text: string }) => <span>{text}</span>,
}));

vi.mock("@/store/useSearchStore", () => ({
  useSearchStore: vi.fn(() => ({
    searchParam: "테스트",
  })),
}));

describe("SearchResultItem", () => {
  const mockResult: SearchResult = {
    id: 1,
    createdAt: "2024-01-01",
    title: "테스트 제목입니다",
    blogName: "테스트 블로그",
    path: "/test-path",
    author: "테스트 블로그",
    blogPlatform: "etc",
    thumbnail: "",
    viewCount: 0,
    tag: [],
    likes: 0,
    comments: 0,
  };

  it("검색 결과의 제목과 블로그명이 렌더링되어야 한다", () => {
    render(<SearchResultItem {...mockResult} />);

    expect(screen.getByText(mockResult.title)).toBeInTheDocument();
    expect(screen.getByText(mockResult.blogName)).toBeInTheDocument();
  });

  it("결과를 클릭하면 올바른 경로로 이동할 수 있어야 한다", () => {
    render(<SearchResultItem {...mockResult} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", String(mockResult.id));
  });

  it("블로그명은 회색으로 표시되어야 한다", () => {
    render(<SearchResultItem {...mockResult} />);

    const blogName = screen.getByText(mockResult.blogName);
    expect(blogName.closest("p")).toHaveClass("text-gray-500");
  });

  it("제목에 hover 시 밑줄이 표시되어야 한다", () => {
    render(<SearchResultItem {...mockResult} />);

    const titleLink = screen.getByRole("link");
    expect(titleLink).toHaveClass("hover:underline");
  });
});
