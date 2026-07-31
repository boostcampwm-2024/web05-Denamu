import type { ReactNode } from "react";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { addQnaMessage, createQna, getQna, getQnaList, verifyQnaPassword } from "@/api/services/qna";
import {
  useAddQnaMessage,
  useCreateQna,
  useQna,
  useQnaList,
  useVerifyQnaPassword,
} from "@/hooks/queries/useQna";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

vi.mock("@/api/services/qna", () => ({
  getQnaList: vi.fn(),
  getQna: vi.fn(),
  createQna: vi.fn(),
  verifyQnaPassword: vi.fn(),
  addQnaMessage: vi.fn(),
}));

const mocked = {
  getQnaList: vi.mocked(getQnaList),
  getQna: vi.mocked(getQna),
  createQna: vi.mocked(createQna),
  verifyQnaPassword: vi.mocked(verifyQnaPassword),
  addQnaMessage: vi.mocked(addQnaMessage),
};

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { wrapper };
};

describe("useQnaList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocked.getQnaList.mockResolvedValue({ result: [], page: 1, limit: 10, totalCount: 0, hasMore: false });
  });

  it("params를 그대로 전달해 getQnaList를 호출한다", async () => {
    const { wrapper } = createWrapper();

    renderHook(() => useQnaList({ page: 2, limit: 5 }), { wrapper });

    await waitFor(() => expect(mocked.getQnaList).toHaveBeenCalledWith({ page: 2, limit: 5 }));
  });
});

describe("useQna", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocked.getQna.mockResolvedValue({
      id: 1,
      title: "문의",
      isSecret: false,
      status: "PENDING",
      authorLabel: "홍길동",
      createdAt: "2026-07-20T09:00:00.000Z",
      messages: [],
    });
  });

  it("id가 있으면 getQna(id)를 호출한다", async () => {
    const { wrapper } = createWrapper();

    renderHook(() => useQna(9), { wrapper });

    await waitFor(() => expect(mocked.getQna).toHaveBeenCalledWith(9));
  });

  it("id가 null이면 조회하지 않는다", async () => {
    const { wrapper } = createWrapper();

    renderHook(() => useQna(null), { wrapper });

    await new Promise((r) => setTimeout(r, 0));
    expect(mocked.getQna).not.toHaveBeenCalled();
  });
});

describe("useCreateQna", () => {
  it("입력한 payload로 createQna를 호출한다", async () => {
    mocked.createQna.mockResolvedValue({ id: 1 });
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCreateQna(), { wrapper });

    result.current.mutate({ title: "제목", content: "내용", isSecret: false });

    await waitFor(() =>
      expect(mocked.createQna).toHaveBeenCalledWith({ title: "제목", content: "내용", isSecret: false })
    );
  });
});

describe("useVerifyQnaPassword", () => {
  it("비밀번호로 verifyQnaPassword를 호출한다", async () => {
    mocked.verifyQnaPassword.mockResolvedValue({
      id: 1,
      title: "문의",
      isSecret: true,
      status: "PENDING",
      authorLabel: "비회원",
      createdAt: "2026-07-20T09:00:00.000Z",
      messages: [],
    });
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useVerifyQnaPassword(1), { wrapper });

    result.current.mutate({ password: "1234" });

    await waitFor(() => expect(mocked.verifyQnaPassword).toHaveBeenCalledWith(1, { password: "1234" }));
  });
});

describe("useAddQnaMessage", () => {
  it("추가 질문 내용으로 addQnaMessage를 호출하고, 응답은 message만 있어도 상세 쿼리를 재조회한다", async () => {
    mocked.addQnaMessage.mockResolvedValue(undefined);
    mocked.getQna.mockResolvedValue({
      id: 1,
      title: "문의",
      isSecret: false,
      status: "PENDING",
      authorLabel: "홍길동",
      createdAt: "2026-07-20T09:00:00.000Z",
      messages: [],
    });
    const { wrapper } = createWrapper();
    renderHook(() => useQna(1), { wrapper });
    const { result } = renderHook(() => useAddQnaMessage(1), { wrapper });

    await waitFor(() => expect(mocked.getQna).toHaveBeenCalledTimes(1));

    result.current.mutate({ content: "추가 질문" });

    await waitFor(() => expect(mocked.addQnaMessage).toHaveBeenCalledWith(1, { content: "추가 질문" }));
    await waitFor(() => expect(mocked.getQna).toHaveBeenCalledTimes(2));
  });
});
