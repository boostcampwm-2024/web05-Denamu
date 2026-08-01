import type { ReactNode } from "react";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";

import BoardListPage from "@/pages/BoardListPage.tsx";

import { BoardSummary } from "@/types/board";
import { QnaSummary } from "@/types/qna";
import { fireEvent, render, screen } from "@testing-library/react";

const mockNavigate = vi.fn();
const createMutateMock = vi.hoisted(() => vi.fn());
const toastMock = vi.hoisted(() => vi.fn());

let boardsState: {
  data: { result: BoardSummary[]; totalCount: number } | undefined;
  isLoading: boolean;
  isError: boolean;
};
let qnaListState: {
  data: { result: QnaSummary[]; totalCount: number } | undefined;
  isLoading: boolean;
  isError: boolean;
};
let authState: { role: "guest" | "user" | "admin" };

const useBoardsMock = vi.fn<
  (params: { page: number; limit: number; category: string }, enabled: boolean) => typeof boardsState
>(() => boardsState);
const useQnaListMock = vi.fn<
  (params: { page: number; limit: number }, enabled: boolean) => typeof qnaListState
>(() => qnaListState);

vi.mock("lucide-react", () => lucideProxy());

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
}));

vi.mock("react-helmet", () => ({
  Helmet: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/layout/Layout", () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/hooks/common/useCustomToast", () => ({
  useCustomToast: () => ({ toast: toastMock }),
}));

vi.mock("@/hooks/queries/useBoards", () => ({
  useBoards: (params: { page: number; limit: number; category: string }, enabled: boolean) =>
    useBoardsMock(params, enabled),
}));

vi.mock("@/hooks/queries/useQna", () => ({
  useQnaList: (params: { page: number; limit: number }, enabled: boolean) => useQnaListMock(params, enabled),
  useCreateQna: () => ({ mutate: createMutateMock, isPending: false }),
}));

vi.mock("@/store/useAuthStore", () => ({
  useAuthStore: () => authState,
}));

const makeBoard = (overrides: Partial<BoardSummary> = {}): BoardSummary => ({
  id: 1,
  title: "공지 제목",
  isPinned: false,
  status: "PUBLISHED",
  category: "NOTICE",
  startAt: null,
  endAt: null,
  createdAt: "2026-07-20T09:00:00.000Z",
  ...overrides,
});

const makeQna = (overrides: Partial<QnaSummary> = {}): QnaSummary => ({
  id: 1,
  title: "문의 제목",
  isSecret: false,
  status: "PENDING",
  authorLabel: "홍길동",
  createdAt: "2026-07-20T09:00:00.000Z",
  ...overrides,
});

describe("BoardListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    boardsState = { data: { result: [], totalCount: 0 }, isLoading: false, isError: false };
    qnaListState = { data: { result: [], totalCount: 0 }, isLoading: false, isError: false };
    authState = { role: "guest" };
  });

  it("로딩 중이면 로딩 문구를 표시한다", () => {
    boardsState = { data: undefined, isLoading: true, isError: false };
    render(<BoardListPage />);

    expect(screen.getByText("불러오는 중...")).toBeInTheDocument();
  });

  it("에러 시 에러 문구를 표시한다", () => {
    boardsState = { data: undefined, isLoading: false, isError: true };
    render(<BoardListPage />);

    expect(screen.getByText("공지사항을 불러오지 못했습니다.")).toBeInTheDocument();
  });

  it("공지가 없으면 안내 문구를 표시한다", () => {
    render(<BoardListPage />);

    expect(screen.getByText("등록된 공지사항이 없습니다.")).toBeInTheDocument();
  });

  it("고정 공지 배지와 제목을 렌더링한다", () => {
    boardsState = {
      data: { result: [makeBoard({ id: 3, title: "서비스 정기 점검 안내", isPinned: true })], totalCount: 1 },
      isLoading: false,
      isError: false,
    };
    render(<BoardListPage />);

    expect(screen.getByText("서비스 정기 점검 안내")).toBeInTheDocument();
    expect(screen.getByText("고정")).toBeInTheDocument();
  });

  it("공지 클릭 시 상세 페이지로 이동한다", () => {
    boardsState = {
      data: { result: [makeBoard({ id: 7, title: "이벤트 안내" })], totalCount: 1 },
      isLoading: false,
      isError: false,
    };
    render(<BoardListPage />);

    fireEvent.click(screen.getByText("이벤트 안내"));

    expect(mockNavigate).toHaveBeenCalledWith("/board/7");
  });

  it("기본 진입 시 NOTICE 분류로 조회한다", () => {
    render(<BoardListPage />);

    expect(useBoardsMock).toHaveBeenLastCalledWith({ page: 1, limit: 10, category: "NOTICE" }, true);
  });

  it("FAQ 탭 클릭 시 FAQ 분류로 조회하고 안내 문구도 FAQ 기준으로 바뀐다", () => {
    render(<BoardListPage />);

    fireEvent.mouseDown(screen.getByRole("tab", { name: "FAQ" }), { button: 0 });

    expect(useBoardsMock).toHaveBeenLastCalledWith({ page: 1, limit: 10, category: "FAQ" }, true);
    expect(screen.getByText("등록된 FAQ가 없습니다.")).toBeInTheDocument();
  });

  it("totalCount가 페이지 크기를 초과하면 페이지네이션을 표시하고, 다음 클릭 시 page 파라미터를 증가시킨다", () => {
    boardsState = { data: { result: [makeBoard()], totalCount: 25 }, isLoading: false, isError: false };
    render(<BoardListPage />);

    expect(screen.getByText("1 / 3")).toBeInTheDocument();
    expect(useBoardsMock).toHaveBeenLastCalledWith({ page: 1, limit: 10, category: "NOTICE" }, true);

    fireEvent.click(screen.getByRole("button", { name: "다음" }));

    expect(useBoardsMock).toHaveBeenLastCalledWith({ page: 2, limit: 10, category: "NOTICE" }, true);
  });

  it("첫 페이지에서는 이전 버튼이 비활성화된다", () => {
    boardsState = { data: { result: [makeBoard()], totalCount: 25 }, isLoading: false, isError: false };
    render(<BoardListPage />);

    expect(screen.getByRole("button", { name: "이전" })).toBeDisabled();
  });

  describe("Q&A 탭", () => {
    const openQnaTab = () => fireEvent.mouseDown(screen.getByRole("tab", { name: "Q&A" }), { button: 0 });
    const openQnaForm = () => {
      openQnaTab();
      fireEvent.click(screen.getByRole("button", { name: "문의하기" }));
    };

    it("Q&A 탭으로 전환하면 useQnaList가 활성화되고 useBoards는 비활성화된다", () => {
      render(<BoardListPage />);

      openQnaTab();

      expect(useQnaListMock).toHaveBeenLastCalledWith({ page: 1, limit: 10 }, true);
      expect(useBoardsMock).toHaveBeenLastCalledWith({ page: 1, limit: 10, category: "NOTICE" }, false);
    });

    it("문의가 없으면 안내 문구를 표시한다", () => {
      render(<BoardListPage />);
      openQnaTab();

      expect(screen.getByText("등록된 문의가 없습니다.")).toBeInTheDocument();
    });

    it("문의 클릭 시 /qna/:id로 이동한다", () => {
      qnaListState = {
        data: { result: [makeQna({ id: 9, title: "질문 있습니다" })], totalCount: 1 },
        isLoading: false,
        isError: false,
      };
      render(<BoardListPage />);
      openQnaTab();

      fireEvent.click(screen.getByText("질문 있습니다"));

      expect(mockNavigate).toHaveBeenCalledWith("/qna/9");
    });

    it("Q&A 탭이 아니면 문의하기 버튼이 보이지 않는다", () => {
      render(<BoardListPage />);

      expect(screen.queryByRole("button", { name: "문의하기" })).not.toBeInTheDocument();
    });

    it("문의하기 클릭 시 모달 없이 같은 페이지에서 폼이 목록을 대체한다", () => {
      render(<BoardListPage />);
      openQnaForm();

      expect(screen.getByRole("heading", { name: "문의하기" })).toBeInTheDocument();
      expect(screen.queryByRole("tab", { name: "Q&A" })).not.toBeInTheDocument();
      expect(screen.getByPlaceholderText("제목을 입력하세요")).toBeInTheDocument();
    });

    it("목록으로 클릭 시 폼이 닫히고 다시 탭 목록이 보인다", () => {
      render(<BoardListPage />);
      openQnaForm();

      fireEvent.click(screen.getByRole("button", { name: "목록으로" }));

      expect(screen.queryByPlaceholderText("제목을 입력하세요")).not.toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Q&A" })).toBeInTheDocument();
    });

    it("비회원이 필수 항목 없이는 등록 버튼이 비활성화되고, 모두 입력하면 createQna를 호출한다", () => {
      render(<BoardListPage />);
      openQnaForm();

      const submitButton = screen.getByRole("button", { name: "등록" });
      expect(submitButton).toBeDisabled();

      fireEvent.change(screen.getByPlaceholderText("제목을 입력하세요"), { target: { value: "질문 제목" } });
      fireEvent.change(screen.getByPlaceholderText("문의 내용을 입력하세요"), { target: { value: "질문 내용" } });
      fireEvent.change(screen.getByPlaceholderText("닉네임"), { target: { value: "홍길동" } });
      fireEvent.change(screen.getByPlaceholderText("답변 알림을 받을 이메일"), {
        target: { value: "guest@test.com" },
      });
      fireEvent.change(screen.getByPlaceholderText("추가 질문/열람 시 필요한 비밀번호"), {
        target: { value: "pw1234" },
      });
      fireEvent.click(screen.getByLabelText(/개인정보처리방침/));

      expect(submitButton).not.toBeDisabled();
      fireEvent.click(submitButton);

      expect(createMutateMock).toHaveBeenCalledWith(
        {
          title: "질문 제목",
          content: "질문 내용",
          isSecret: false,
          password: "pw1234",
          guestName: "홍길동",
          guestEmail: "guest@test.com",
        },
        expect.anything()
      );
    });

    it("회원이면 닉네임/이메일 입력 없이도 등록 버튼이 활성화된다", () => {
      authState = { role: "user" };
      render(<BoardListPage />);
      openQnaForm();

      fireEvent.change(screen.getByPlaceholderText("제목을 입력하세요"), { target: { value: "질문 제목" } });
      fireEvent.change(screen.getByPlaceholderText("문의 내용을 입력하세요"), { target: { value: "질문 내용" } });

      expect(screen.getByRole("button", { name: "등록" })).not.toBeDisabled();
      expect(screen.queryByPlaceholderText("닉네임")).not.toBeInTheDocument();
    });
  });
});
