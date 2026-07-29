import type { ReactNode } from "react";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";

import BoardDetailPage from "@/pages/BoardDetailPage.tsx";

import { BoardDetail } from "@/types/board";
import { fireEvent, render, screen } from "@testing-library/react";

const mockNavigate = vi.fn();
let params: { id?: string };

let boardState: { data: BoardDetail | undefined; isLoading: boolean; isError: boolean };

vi.mock("lucide-react", () => lucideProxy());

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useParams: () => params,
}));

vi.mock("react-helmet", () => ({
  Helmet: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/layout/Layout", () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/board/BoardContent", () => ({
  BoardContent: ({ content }: { content: string }) => <div data-testid="board-content">{content}</div>,
}));

vi.mock("@/hooks/queries/useBoards", () => ({
  useBoard: () => boardState,
}));

const makeDetail = (overrides: Partial<BoardDetail> = {}): BoardDetail => ({
  id: 5,
  title: "정기 점검 안내",
  isPinned: true,
  status: "PUBLISHED",
  category: "NOTICE",
  startAt: null,
  endAt: null,
  createdAt: "2026-07-20T09:00:00.000Z",
  content: "<p>정기 점검으로 인해 서비스 이용이 일시 중단됩니다.</p>",
  authorName: "관리자",
  updatedAt: "2026-07-20T09:00:00.000Z",
  ...overrides,
});

describe("BoardDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    params = { id: "5" };
    boardState = { data: makeDetail(), isLoading: false, isError: false };
  });

  it("로딩 중이면 로딩 문구를 표시한다", () => {
    boardState = { data: undefined, isLoading: true, isError: false };
    render(<BoardDetailPage />);

    expect(screen.getByText("불러오는 중...")).toBeInTheDocument();
  });

  it("에러이면 존재하지 않는다는 안내 문구를 표시한다", () => {
    boardState = { data: undefined, isLoading: false, isError: true };
    render(<BoardDetailPage />);

    expect(screen.getByText("존재하지 않거나 접근할 수 없습니다.")).toBeInTheDocument();
  });

  it("data가 없으면(404 등) 존재하지 않는다는 안내 문구를 표시한다", () => {
    boardState = { data: undefined, isLoading: false, isError: false };
    render(<BoardDetailPage />);

    expect(screen.getByText("존재하지 않거나 접근할 수 없습니다.")).toBeInTheDocument();
  });

  it("정상 데이터면 제목과 본문을 렌더링한다", () => {
    render(<BoardDetailPage />);

    expect(screen.getByRole("heading", { name: "정기 점검 안내" })).toBeInTheDocument();
    expect(screen.getByTestId("board-content")).toHaveTextContent(
      "정기 점검으로 인해 서비스 이용이 일시 중단됩니다."
    );
  });

  it("목록으로 버튼 클릭 시 게시판 목록 페이지로 이동한다", () => {
    render(<BoardDetailPage />);

    fireEvent.click(screen.getByRole("button", { name: /목록으로/ }));

    expect(mockNavigate).toHaveBeenCalledWith("/board");
  });
});
