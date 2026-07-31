import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";

import AdminQnaTab from "@/components/admin/qna/AdminQnaTab.tsx";

import { QnaDetail, QnaPage, QnaSummary } from "@/types/qna";
import { fireEvent, render, screen } from "@testing-library/react";

const useAdminQnaListMock = vi.hoisted(() => vi.fn());
const useAdminQnaMock = vi.hoisted(() => vi.fn());
const answerMutateMock = vi.hoisted(() => vi.fn());
const toastMock = vi.hoisted(() => vi.fn());

vi.mock("lucide-react", () => lucideProxy());

vi.mock("@/hooks/common/useCustomToast", () => ({
  useCustomToast: () => ({ toast: toastMock }),
}));

vi.mock("@/hooks/queries/useAdminQna", () => ({
  useAdminQnaList: (params: unknown) => useAdminQnaListMock(params),
  useAdminQna: (id: number | null) => useAdminQnaMock(id),
  useAnswerQna: () => ({ mutate: answerMutateMock, isPending: false }),
}));

const makeQna = (overrides: Partial<QnaSummary> = {}): QnaSummary => ({
  id: 1,
  title: "문의 제목",
  isSecret: false,
  status: "PENDING",
  authorLabel: "홍길동",
  createdAt: "2026-07-20T09:00:00.000Z",
  ...overrides,
});

const makePage = (result: QnaSummary[], totalCount = result.length): QnaPage<QnaSummary> => ({
  result,
  page: 1,
  limit: 10,
  totalCount,
  hasMore: false,
});

describe("AdminQnaTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAdminQnaListMock.mockReturnValue({ data: makePage([]), isLoading: false, isError: false });
    useAdminQnaMock.mockReturnValue({ data: undefined });
  });

  it("로딩 중이면 로딩 문구를 표시한다", () => {
    useAdminQnaListMock.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    render(<AdminQnaTab />);

    expect(screen.getByText("불러오는 중...")).toBeInTheDocument();
  });

  it("문의가 없으면 안내 문구를 표시한다", () => {
    render(<AdminQnaTab />);

    expect(screen.getByText("등록된 문의가 없습니다.")).toBeInTheDocument();
  });

  it("문의 카드를 클릭하면 상세 화면으로 전환되고 답변 등록 시 useAnswerQna를 호출한다", () => {
    useAdminQnaListMock.mockReturnValue({ data: makePage([makeQna({ id: 7, title: "질문 있습니다" })]), isLoading: false, isError: false });
    const detail: QnaDetail = {
      id: 7,
      title: "질문 있습니다",
      isSecret: false,
      status: "PENDING",
      authorLabel: "홍길동",
      createdAt: "2026-07-20T09:00:00.000Z",
      messages: [{ type: "QUESTION", content: "질문 내용", adminName: null, createdAt: "2026-07-20T09:00:00.000Z" }],
    };
    useAdminQnaMock.mockReturnValue({ data: detail });

    render(<AdminQnaTab />);
    fireEvent.click(screen.getByText("질문 있습니다"));

    expect(screen.getByText("질문 내용")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("답변을 입력하세요"), { target: { value: "답변합니다" } });
    fireEvent.click(screen.getByRole("button", { name: "답변 등록" }));

    expect(answerMutateMock).toHaveBeenCalledWith({ content: "답변합니다" }, expect.anything());
  });
});
