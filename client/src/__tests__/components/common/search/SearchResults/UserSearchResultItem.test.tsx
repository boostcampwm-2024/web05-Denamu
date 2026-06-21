import { describe, it, expect, vi } from "vitest";

import UserSearchResultItem from "@/components/search/SearchResults/UserSearchResultItem";

import { UserSearchResult } from "@/types/search.ts";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("@/components/search/SearchHigilight", () => ({
  default: ({ text }: { text: string }) => <span>{text}</span>,
}));

vi.mock("@/store/useSearchStore", () => ({
  useSearchStore: vi.fn(() => ({
    searchParam: "김",
  })),
}));

describe("UserSearchResultItem", () => {
  const mockUser: UserSearchResult = {
    id: 7,
    userName: "김개발",
    profileImage: null,
  };

  it("유저 닉네임이 렌더링되어야 한다", () => {
    render(<UserSearchResultItem {...mockUser} onSelect={vi.fn()} />);

    expect(screen.getByText(mockUser.userName)).toBeInTheDocument();
  });

  it("클릭하면 해당 유저 id로 onSelect가 호출되어야 한다", () => {
    const onSelect = vi.fn();
    render(<UserSearchResultItem {...mockUser} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole("button"));

    expect(onSelect).toHaveBeenCalledWith(mockUser.id);
  });
});
