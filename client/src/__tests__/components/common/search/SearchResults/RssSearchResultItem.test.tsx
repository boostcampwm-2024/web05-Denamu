import { describe, it, expect, vi } from "vitest";

import RssSearchResultItem from "@/components/search/SearchResults/RssSearchResultItem";

import { RssSearchResult } from "@/types/search.ts";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("@/components/search/SearchHigilight", () => ({
  default: ({ text }: { text: string }) => <span>{text}</span>,
}));

vi.mock("@/store/useSearchStore", () => ({
  useSearchStore: vi.fn(() => ({
    searchParam: "denamu",
  })),
}));

describe("RssSearchResultItem", () => {
  const mockRss: RssSearchResult = {
    id: 7,
    name: "denamu.log",
    blogPlatform: "velog",
    blogImage: null,
  };

  it("RSS 이름이 렌더링되어야 한다", () => {
    render(<RssSearchResultItem {...mockRss} onSelect={vi.fn()} />);

    expect(screen.getByText(mockRss.name)).toBeInTheDocument();
  });

  it("클릭하면 해당 RSS id로 onSelect가 호출되어야 한다", () => {
    const onSelect = vi.fn();
    render(<RssSearchResultItem {...mockRss} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole("button"));

    expect(onSelect).toHaveBeenCalledWith(mockRss.id);
  });
});
