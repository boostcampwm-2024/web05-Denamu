import { describe, it, expect, vi } from "vitest";

import FilterButton from "@/components/search/SearchFilters/FilterButton";

import { useSearchStore } from "@/store/useSearchStore";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("@/store/useSearchStore", () => ({
  useSearchStore: vi.fn(() => ({
    currentFilter: "title",
    setFilter: vi.fn(),
    setPage: vi.fn(),
  })),
}));

describe("FilterButton", () => {
  it("모든 필터 옵션이 렌더링되어야 한다", () => {
    render(<FilterButton />);

    expect(screen.getByText("제목")).toBeInTheDocument();
    expect(screen.getByText("RSS 이름")).toBeInTheDocument();
    expect(screen.getByText("RSS 이름 + 제목")).toBeInTheDocument();
  });

  it("현재 선택된 필터에 accent 스타일이 적용되어야 한다", () => {
    render(<FilterButton />);

    const titleFilter = screen.getByText("제목").parentElement;
    expect(titleFilter).toHaveClass("bg-accent");
  });

  it("필터 클릭시 store 업데이트 함수가 호출되어야 한다", () => {
    const mockSetFilter = vi.fn();
    const mockSetPage = vi.fn();

    vi.mocked(useSearchStore).mockReturnValue({
      currentFilter: "title",
      setFilter: mockSetFilter,
      setPage: mockSetPage,
    });

    render(<FilterButton />);

    fireEvent.click(screen.getByText("RSS 이름"));

    expect(mockSetFilter).toHaveBeenCalledWith("blogName");
    expect(mockSetPage).toHaveBeenCalledWith(1);
  });
});
