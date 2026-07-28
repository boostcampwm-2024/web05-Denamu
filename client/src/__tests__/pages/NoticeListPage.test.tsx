import type { ReactNode } from "react";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";

import NoticeListPage from "@/pages/NoticeListPage.tsx";

import { NoticeSummary } from "@/types/notice";
import { fireEvent, render, screen } from "@testing-library/react";

const mockNavigate = vi.fn();

let noticesState: {
  data: { result: NoticeSummary[]; totalCount: number } | undefined;
  isLoading: boolean;
  isError: boolean;
};

const useNoticesMock = vi.fn<
  (params: { page: number; limit: number }) => typeof noticesState
>(() => noticesState);

vi.mock("lucide-react", () => lucideProxy());

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("react-helmet", () => ({
  Helmet: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/layout/Layout", () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/hooks/queries/useNotices", () => ({
  useNotices: (params: { page: number; limit: number }) => useNoticesMock(params),
}));

const makeNotice = (overrides: Partial<NoticeSummary> = {}): NoticeSummary => ({
  id: 1,
  title: "공지 제목",
  isPinned: false,
  status: "PUBLISHED",
  startAt: null,
  endAt: null,
  createdAt: "2026-07-20T09:00:00.000Z",
  ...overrides,
});

describe("NoticeListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    noticesState = { data: { result: [], totalCount: 0 }, isLoading: false, isError: false };
  });

  it("로딩 중이면 로딩 문구를 표시한다", () => {
    noticesState = { data: undefined, isLoading: true, isError: false };
    render(<NoticeListPage />);

    expect(screen.getByText("불러오는 중...")).toBeInTheDocument();
  });

  it("에러 시 에러 문구를 표시한다", () => {
    noticesState = { data: undefined, isLoading: false, isError: true };
    render(<NoticeListPage />);

    expect(screen.getByText("공지사항을 불러오지 못했습니다.")).toBeInTheDocument();
  });

  it("공지가 없으면 안내 문구를 표시한다", () => {
    render(<NoticeListPage />);

    expect(screen.getByText("등록된 공지사항이 없습니다.")).toBeInTheDocument();
  });

  it("고정 공지 배지와 제목을 렌더링한다", () => {
    noticesState = {
      data: { result: [makeNotice({ id: 3, title: "서비스 정기 점검 안내", isPinned: true })], totalCount: 1 },
      isLoading: false,
      isError: false,
    };
    render(<NoticeListPage />);

    expect(screen.getByText("서비스 정기 점검 안내")).toBeInTheDocument();
    expect(screen.getByText("고정")).toBeInTheDocument();
  });

  it("공지 클릭 시 상세 페이지로 이동한다", () => {
    noticesState = {
      data: { result: [makeNotice({ id: 7, title: "이벤트 안내" })], totalCount: 1 },
      isLoading: false,
      isError: false,
    };
    render(<NoticeListPage />);

    fireEvent.click(screen.getByText("이벤트 안내"));

    expect(mockNavigate).toHaveBeenCalledWith("/notice/7");
  });

  it("totalCount가 페이지 크기를 초과하면 페이지네이션을 표시하고, 다음 클릭 시 page 파라미터를 증가시킨다", () => {
    noticesState = { data: { result: [makeNotice()], totalCount: 25 }, isLoading: false, isError: false };
    render(<NoticeListPage />);

    expect(screen.getByText("1 / 3")).toBeInTheDocument();
    expect(useNoticesMock).toHaveBeenLastCalledWith({ page: 1, limit: 10 });

    fireEvent.click(screen.getByRole("button", { name: "다음" }));

    expect(useNoticesMock).toHaveBeenLastCalledWith({ page: 2, limit: 10 });
  });

  it("첫 페이지에서는 이전 버튼이 비활성화된다", () => {
    noticesState = { data: { result: [makeNotice()], totalCount: 25 }, isLoading: false, isError: false };
    render(<NoticeListPage />);

    expect(screen.getByRole("button", { name: "이전" })).toBeDisabled();
  });
});
