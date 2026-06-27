import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import UserSearchResultList from "@/components/search/SearchResults/UserSearchResultList.tsx";

import { render, screen } from "@testing-library/react";

let searchParam: string;
let queryState: { data: unknown; isLoading: boolean; error: unknown };

vi.mock("lucide-react", () => lucideProxy());

vi.mock("@/store/useSearchStore", () => ({ useSearchStore: () => ({ searchParam, page: 1 }) }));
vi.mock("@/hooks/common/useNavigateToProfile", () => ({ useNavigateToProfile: () => vi.fn() }));
vi.mock("@/hooks/queries/useUserSearch", () => ({ useUserSearch: () => queryState }));

vi.mock("@/components/ui/command", () => {
  const pass = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  return { CommandList: pass, CommandEmpty: pass, CommandGroup: ({ children, heading }: { children: React.ReactNode; heading: string }) => <div>{heading}{children}</div> };
});

vi.mock("@/components/search/searchPages/SearchPages", () => ({ default: () => <div data-testid="pages" /> }));
vi.mock("@/components/search/SearchResults/UserSearchResultItem", () => ({
  default: ({ userName }: { userName: string }) => <div data-testid="user-item">{userName}</div>,
}));

describe("UserSearchResultList", () => {
  beforeEach(() => {
    searchParam = "kim";
    queryState = { data: { data: { totalCount: 0, totalPages: 0, result: [] } }, isLoading: false, error: null };
  });

  it("로딩 중이면 로더를 표시해야 한다", () => {
    queryState.isLoading = true;
    render(<UserSearchResultList onClose={vi.fn()} />);

    expect(screen.getByTestId("lucide-Loader")).toBeInTheDocument();
  });

  it("에러면 에러 문구를 표시해야 한다", () => {
    queryState.error = new Error("fail");
    render(<UserSearchResultList onClose={vi.fn()} />);

    expect(screen.getByText("에러발생")).toBeInTheDocument();
  });

  it("검색어가 없으면 안내 문구를 표시해야 한다", () => {
    searchParam = "";
    render(<UserSearchResultList onClose={vi.fn()} />);

    expect(screen.getByText("검색어를 입력해주세요")).toBeInTheDocument();
  });

  it("결과가 없으면 빈 안내를 표시해야 한다", () => {
    render(<UserSearchResultList onClose={vi.fn()} />);

    expect(screen.getByText("검색결과가 없습니다")).toBeInTheDocument();
  });

  it("결과가 있으면 헤딩과 유저 아이템을 렌더링해야 한다", () => {
    queryState.data = {
      data: { totalCount: 2, totalPages: 1, result: [{ id: 1, userName: "kim" }, { id: 2, userName: "lee" }] },
    };
    render(<UserSearchResultList onClose={vi.fn()} />);

    expect(screen.getByText(/검색결과 \(총 2건\)/)).toBeInTheDocument();
    expect(screen.getAllByTestId("user-item")).toHaveLength(2);
  });
});
