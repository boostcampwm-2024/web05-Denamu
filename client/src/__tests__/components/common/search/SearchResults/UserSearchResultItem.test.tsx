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
    introduction: "안녕하세요, 백엔드 개발자입니다.",
    blogCount: 1,
  };

  it("유저 닉네임이 렌더링되어야 한다", () => {
    render(<UserSearchResultItem {...mockUser} onSelect={vi.fn()} />);

    expect(screen.getByText(mockUser.userName)).toBeInTheDocument();
  });

  it("자기소개가 렌더링되어야 한다", () => {
    render(<UserSearchResultItem {...mockUser} onSelect={vi.fn()} />);

    expect(screen.getByText(mockUser.introduction as string)).toBeInTheDocument();
  });

  it("소유 RSS 개수와 체크 아이콘이 렌더링되어야 한다", () => {
    render(<UserSearchResultItem {...mockUser} onSelect={vi.fn()} />);

    expect(screen.getByText(`인증된 RSS ${mockUser.blogCount}개`)).toBeInTheDocument();
    expect(screen.getByTestId("badge-check-icon")).toBeInTheDocument();
  });

  it("RSS가 없으면 체크 아이콘이 렌더링되지 않아야 한다", () => {
    render(<UserSearchResultItem {...mockUser} blogCount={0} onSelect={vi.fn()} />);

    expect(screen.queryByTestId("badge-check-icon")).not.toBeInTheDocument();
  });

  it("클릭하면 해당 유저 id로 onSelect가 호출되어야 한다", () => {
    const onSelect = vi.fn();
    render(<UserSearchResultItem {...mockUser} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole("button"));

    expect(onSelect).toHaveBeenCalledWith(mockUser.id);
  });
});
