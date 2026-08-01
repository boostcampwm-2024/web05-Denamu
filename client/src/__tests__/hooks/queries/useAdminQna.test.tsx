import type { ReactNode } from "react";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { adminQna } from "@/api/services/admin/qna";
import { useAdminQna, useAdminQnaList, useAnswerQna } from "@/hooks/queries/useAdminQna";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

vi.mock("@/api/services/admin/qna", () => ({
  adminQna: {
    getList: vi.fn(),
    getDetail: vi.fn(),
    answer: vi.fn(),
  },
}));

const mocked = {
  getList: vi.mocked(adminQna.getList),
  getDetail: vi.mocked(adminQna.getDetail),
  answer: vi.mocked(adminQna.answer),
};

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { wrapper };
};

describe("useAdminQnaList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocked.getList.mockResolvedValue({ result: [], page: 1, limit: 10, totalCount: 0, hasMore: false });
  });

  it("params를 그대로 전달해 getList를 호출한다", async () => {
    const { wrapper } = createWrapper();

    renderHook(() => useAdminQnaList({ page: 1, limit: 10, status: "PENDING" }), { wrapper });

    await waitFor(() => expect(mocked.getList).toHaveBeenCalledWith({ page: 1, limit: 10, status: "PENDING" }));
  });
});

describe("useAdminQna", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocked.getDetail.mockResolvedValue({
      id: 1,
      title: "문의",
      isSecret: false,
      status: "PENDING",
      authorLabel: "홍길동",
      createdAt: "2026-07-20T09:00:00.000Z",
      messages: [],
    });
  });

  it("id가 있으면 getDetail(id)를 호출한다", async () => {
    const { wrapper } = createWrapper();

    renderHook(() => useAdminQna(3), { wrapper });

    await waitFor(() => expect(mocked.getDetail).toHaveBeenCalledWith(3));
  });

  it("id가 null이면 조회하지 않는다", async () => {
    const { wrapper } = createWrapper();

    renderHook(() => useAdminQna(null), { wrapper });

    await new Promise((r) => setTimeout(r, 0));
    expect(mocked.getDetail).not.toHaveBeenCalled();
  });
});

describe("useAnswerQna", () => {
  it("답변 내용으로 answer를 호출하고, 응답은 message만 있어도 상세/목록 쿼리를 재조회한다", async () => {
    mocked.answer.mockResolvedValue(undefined);
    mocked.getDetail.mockResolvedValue({
      id: 1,
      title: "문의",
      isSecret: false,
      status: "ANSWERED",
      authorLabel: "홍길동",
      createdAt: "2026-07-20T09:00:00.000Z",
      messages: [],
    });
    const { wrapper } = createWrapper();
    renderHook(() => useAdminQna(1), { wrapper });
    const { result } = renderHook(() => useAnswerQna(1), { wrapper });

    await waitFor(() => expect(mocked.getDetail).toHaveBeenCalledTimes(1));

    result.current.mutate({ content: "답변 내용" });

    await waitFor(() => expect(mocked.answer).toHaveBeenCalledWith(1, { content: "답변 내용" }));
    await waitFor(() => expect(mocked.getDetail).toHaveBeenCalledTimes(2));
  });
});
