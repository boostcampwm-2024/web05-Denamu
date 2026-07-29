import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { NoticeBell } from "@/components/common/NoticeBell.tsx";

import { BoardSummary } from "@/types/board";
import { render, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";

const mockNavigate = vi.fn();

let noticesState: { data: { result: BoardSummary[] } | undefined; isLoading: boolean };

vi.mock("lucide-react", () => lucideProxy());

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("@/hooks/queries/useBoards", () => ({
  useBoards: () => noticesState,
}));

vi.mock("@/components/ui/popover", () => {
  const passthrough = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  return { Popover: passthrough, PopoverTrigger: passthrough, PopoverContent: passthrough };
});

vi.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const makeNotice = (overrides: Partial<BoardSummary> = {}): BoardSummary => ({
  id: 1,
  title: "공지 제목",
  isPinned: false,
  status: "PUBLISHED",
  startAt: null,
  endAt: null,
  createdAt: "2026-07-20T09:00:00.000Z",
  ...overrides,
});

describe("NoticeBell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    noticesState = { data: { result: [] }, isLoading: false };
  });

  it("로딩 중이면 로딩 문구를 표시한다", () => {
    noticesState = { data: undefined, isLoading: true };
    render(<NoticeBell />);

    expect(screen.getByText("불러오는 중...")).toBeInTheDocument();
  });

  it("공지사항이 없으면 안내 문구를 표시한다", () => {
    noticesState = { data: { result: [] }, isLoading: false };
    render(<NoticeBell />);

    expect(screen.getByText("공지사항이 없습니다.")).toBeInTheDocument();
  });

  it("고정 공지에는 핀 배지를 표시하고, 제목/전체보기를 렌더링한다", () => {
    noticesState = {
      data: { result: [makeNotice({ id: 3, title: "정기 점검 안내", isPinned: true })] },
      isLoading: false,
    };
    render(<NoticeBell />);

    expect(screen.getByText("정기 점검 안내")).toBeInTheDocument();
    expect(screen.getByTestId("lucide-Pin")).toBeInTheDocument();
    expect(screen.getByText("전체보기")).toBeInTheDocument();
  });

  it("고정되지 않은 공지에는 핀 배지를 표시하지 않는다", () => {
    noticesState = { data: { result: [makeNotice({ isPinned: false })] }, isLoading: false };
    render(<NoticeBell />);

    expect(screen.queryByTestId("lucide-Pin")).not.toBeInTheDocument();
  });

  it("공지 항목 클릭 시 상세 페이지로 이동한다", () => {
    noticesState = { data: { result: [makeNotice({ id: 42, title: "이벤트 안내" })] }, isLoading: false };
    render(<NoticeBell />);

    fireEvent.click(screen.getByText("이벤트 안내"));

    expect(mockNavigate).toHaveBeenCalledWith("/notice/42");
  });

  it("전체보기 클릭 시 공지 목록 페이지로 이동한다", () => {
    render(<NoticeBell />);

    fireEvent.click(screen.getByText("전체보기"));

    expect(mockNavigate).toHaveBeenCalledWith("/notice");
  });
});
