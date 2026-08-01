import type { ReactNode } from "react";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";

import QnaDetailPage from "@/pages/QnaDetailPage.tsx";

import { QnaDetail } from "@/types/qna";
import { fireEvent, render, screen } from "@testing-library/react";

const mockNavigate = vi.fn();
const toastMock = vi.hoisted(() => vi.fn());
const verifyMutateMock = vi.hoisted(() => vi.fn());
const addMessageMutateMock = vi.hoisted(() => vi.fn());

let qnaState: { data: QnaDetail | undefined; isLoading: boolean; isError: boolean };

vi.mock("lucide-react", () => lucideProxy());

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: "1" }),
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

vi.mock("@/hooks/queries/useQna", () => ({
  useQna: () => qnaState,
  useVerifyQnaPassword: () => ({ mutate: verifyMutateMock, isPending: false }),
  useAddQnaMessage: () => ({ mutate: addMessageMutateMock, isPending: false }),
}));

describe("QnaDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    qnaState = { data: undefined, isLoading: false, isError: false };
  });

  it("로딩 중이면 로딩 문구를 표시한다", () => {
    qnaState = { data: undefined, isLoading: true, isError: false };
    render(<QnaDetailPage />);

    expect(screen.getByText("불러오는 중...")).toBeInTheDocument();
  });

  it("에러 시 안내 문구를 표시한다", () => {
    qnaState = { data: undefined, isLoading: false, isError: true };
    render(<QnaDetailPage />);

    expect(screen.getByText("존재하지 않는 문의입니다.")).toBeInTheDocument();
  });

  it("비공개 문의는 잠금 화면을 표시하고 비밀번호 확인 시 verify를 호출한다", () => {
    qnaState = {
      data: { id: 1, title: "비공개 문의", isSecret: true, requiresPassword: true },
      isLoading: false,
      isError: false,
    };
    render(<QnaDetailPage />);

    expect(screen.getByText("비공개로 작성된 문의입니다. 비밀번호를 입력해주세요.")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("비밀번호"), { target: { value: "pw1234" } });
    fireEvent.click(screen.getByRole("button", { name: "확인" }));

    expect(verifyMutateMock).toHaveBeenCalledWith({ password: "pw1234" }, expect.anything());
  });

  it("공개 스레드는 질문/답변 메시지를 렌더링한다", () => {
    qnaState = {
      data: {
        id: 1,
        title: "공개 문의",
        isSecret: false,
        status: "ANSWERED",
        authorLabel: "홍길동",
        createdAt: "2026-07-20T09:00:00.000Z",
        messages: [
          { type: "QUESTION", content: "질문 내용", adminName: null, createdAt: "2026-07-20T09:00:00.000Z" },
          { type: "ANSWER", content: "답변 내용", adminName: "관리자A", createdAt: "2026-07-20T10:00:00.000Z" },
        ],
      },
      isLoading: false,
      isError: false,
    };
    render(<QnaDetailPage />);

    expect(screen.getByText("공개 문의")).toBeInTheDocument();
    expect(screen.getByText("질문 내용")).toBeInTheDocument();
    expect(screen.getByText("답변 내용")).toBeInTheDocument();
    expect(screen.getByText("관리자 관리자A")).toBeInTheDocument();
  });

  it("답변완료 상태면 추가 질문 폼을 표시하고 등록 시 addQnaMessage를 호출한다", () => {
    qnaState = {
      data: {
        id: 1,
        title: "공개 문의",
        isSecret: false,
        status: "ANSWERED",
        authorLabel: "홍길동",
        createdAt: "2026-07-20T09:00:00.000Z",
        messages: [],
      },
      isLoading: false,
      isError: false,
    };
    render(<QnaDetailPage />);

    fireEvent.change(screen.getByPlaceholderText("답변을 확인 후 추가로 질문할 내용을 입력하세요"), {
      target: { value: "추가 질문입니다" },
    });
    fireEvent.click(screen.getByRole("button", { name: "등록" }));

    expect(addMessageMutateMock).toHaveBeenCalledWith(
      { content: "추가 질문입니다", password: undefined },
      expect.anything()
    );
  });

  it("답변대기 상태면 추가 질문 폼을 표시하지 않는다", () => {
    qnaState = {
      data: {
        id: 1,
        title: "공개 문의",
        isSecret: false,
        status: "PENDING",
        authorLabel: "홍길동",
        createdAt: "2026-07-20T09:00:00.000Z",
        messages: [],
      },
      isLoading: false,
      isError: false,
    };
    render(<QnaDetailPage />);

    expect(screen.queryByText("추가 질문하기")).not.toBeInTheDocument();
  });
});
