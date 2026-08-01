import { describe, it, expect, vi } from "vitest";

import SearchResultList from "@/components/search/SearchResults/SearchResultList";

import { useSearch } from "@/hooks/queries/useSearch";

import { useSearchStore } from "@/store/useSearchStore";
import { render, screen } from "@testing-library/react";

vi.mock("@/components/search/SearchResults/SearchResultItem", () => ({
  default: ({ title }: { title: string }) => <div data-testid="result-item">{title}</div>,
}));

vi.mock("@/hooks/queries/useSearch", () => ({
  useSearch: vi.fn(),
}));

vi.mock("@/store/useSearchStore", () => ({
  useSearchStore: vi.fn(() => ({
    searchParam: "",
    currentFilter: "title",
    page: 1,
  })),
}));

vi.mock("@/components/search/searchPages/SearchPages", () => ({
  default: () => <div data-testid="search-pages">pagination</div>,
}));

describe("SearchResultList", () => {
  const mockRefetchSearch = vi.fn();

  it("검색어 입력 전에는 안내 메시지를 표시해야 한다", () => {
    vi.mocked(useSearch).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetchSearch: mockRefetchSearch,
    });

    render(<SearchResultList />);
    expect(screen.getByText("검색어를 입력해주세요")).toBeInTheDocument();
  });

  it("로딩 중일 때는 로더를 표시해야 한다", () => {
    vi.mocked(useSearch).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetchSearch: mockRefetchSearch,
    });

    render(<SearchResultList />);
    expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
  });

  it("검색 결과가 없을 때는 메시지를 표시해야 한다", () => {
    vi.mocked(useSearchStore).mockReturnValue({
      searchParam: "검색어",
      currentFilter: "title",
      page: 1,
    });

    vi.mocked(useSearch).mockReturnValue({
      data: {
        data: {
          totalCount: 0,
          totalPages: 0,
          result: [],
        },
        message: "Success",
      },
      isLoading: false,
      error: null,
      refetchSearch: mockRefetchSearch,
    });

    render(<SearchResultList />);
    expect(screen.getByText("검색결과가 없습니다")).toBeInTheDocument();
  });

  it("검색 결과가 있을 때는 결과 목록과 페이지네이션을 표시해야 한다", () => {
    const cardFields = { thumbnail: "", viewCount: 0, tag: [], likes: 0, comments: 0 };
    const mockResults = [
      { id: 1, title: "제목1", blog: { name: "블로그1", platform: "etc" }, path: "/1", createdAt: "2024-01-01", ...cardFields },
      { id: 2, title: "제목2", blog: { name: "블로그2", platform: "etc" }, path: "/2", createdAt: "2024-01-01", ...cardFields },
    ];

    vi.mocked(useSearchStore).mockReturnValue({
      searchParam: "검색어",
      currentFilter: "title",
      page: 1,
    });

    vi.mocked(useSearch).mockReturnValue({
      data: {
        data: {
          totalCount: 2,
          totalPages: 1,
          result: mockResults,
        },
        message: "Success",
      },
      isLoading: false,
      error: null,
      refetchSearch: mockRefetchSearch,
    });

    render(<SearchResultList />);

    expect(screen.getByTestId("command-group-heading")).toHaveTextContent("검색결과 (총 2건)");
    expect(screen.getAllByTestId("result-item")).toHaveLength(2);
    expect(screen.getByTestId("search-pages")).toBeInTheDocument();
  });

  it("에러 발생시 에러 메시지를 표시해야 한다", () => {
    vi.mocked(useSearch).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("에러 발생"),
      refetchSearch: mockRefetchSearch,
    });

    render(<SearchResultList />);
    expect(screen.getByText("에러발생")).toBeInTheDocument();
  });
});
