import { describe, it, expect, vi } from "vitest";

import SearchModal from "@/components/search/SearchModal";

import { useSearchStore } from "@/store/useSearchStore";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("@/components/search/SearchResults/SearchResultList", () => ({
  default: () => <div data-testid="search-results">Mock Search Results</div>,
}));

vi.mock("@/store/useSearchStore", () => ({
  useSearchStore: vi.fn(() => ({
    searchMode: "feed",
    setSearchMode: vi.fn(),
    setPage: vi.fn(),
    resetPage: vi.fn(),
    resetParam: vi.fn(),
    resetFilter: vi.fn(),
    resetMode: vi.fn(),
  })),
}));

describe("SearchModal", () => {
  it("모달이 올바르게 렌더링되어야 한다", () => {
    render(<SearchModal onClose={vi.fn()} />);

    expect(screen.getByPlaceholderText("검색어를 입력하세요")).toBeInTheDocument();
  });

  it("모달 외부 클릭시 초기화 후 닫혀야 한다", () => {
    const mockOnClose = vi.fn();
    const mockResetPage = vi.fn();
    const mockResetParam = vi.fn();
    const mockResetFilter = vi.fn();

    vi.mocked(useSearchStore).mockReturnValue({
      searchMode: "feed",
      setSearchMode: vi.fn(),
      setPage: vi.fn(),
      resetPage: mockResetPage,
      resetParam: mockResetParam,
      resetFilter: mockResetFilter,
      resetMode: vi.fn(),
    });

    const { container } = render(<SearchModal onClose={mockOnClose} />);

    fireEvent.click(container.firstChild!);

    expect(mockResetPage).toHaveBeenCalled();
    expect(mockResetParam).toHaveBeenCalled();
    expect(mockResetFilter).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("모달 내부 클릭시 이벤트가 전파되지 않아야 한다", () => {
    const mockOnClose = vi.fn();

    render(<SearchModal onClose={mockOnClose} />);

    const modalContent = screen.getByPlaceholderText("검색어를 입력하세요").closest("div");
    fireEvent.click(modalContent!);

    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
