import type { ReactNode } from "react";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { getNotice, getNotices } from "@/api/services/notice";
import { useNotice, useNotices } from "@/hooks/queries/useNotices";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

vi.mock("@/api/services/notice", () => ({
  getNotices: vi.fn(),
  getNotice: vi.fn(),
}));

const mocked = { getNotices: vi.mocked(getNotices), getNotice: vi.mocked(getNotice) };

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { wrapper };
};

describe("useNotices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocked.getNotices.mockResolvedValue({ result: [], page: 1, limit: 10, totalCount: 0, hasMore: false });
  });

  it("params를 그대로 전달해 getNotices를 호출한다", async () => {
    const { wrapper } = createWrapper();

    renderHook(() => useNotices({ page: 2, limit: 5 }), { wrapper });

    await waitFor(() => expect(mocked.getNotices).toHaveBeenCalledWith({ page: 2, limit: 5 }));
  });

  it("enabled=false이면 조회하지 않는다", async () => {
    const { wrapper } = createWrapper();

    renderHook(() => useNotices({ page: 1, limit: 5 }, false), { wrapper });

    await new Promise((r) => setTimeout(r, 0));
    expect(mocked.getNotices).not.toHaveBeenCalled();
  });
});

describe("useNotice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocked.getNotice.mockResolvedValue({
      id: 1,
      title: "공지",
      isPinned: false,
      status: "PUBLISHED",
      startAt: null,
      endAt: null,
      createdAt: "2026-07-20T09:00:00.000Z",
      content: "<p>내용</p>",
      authorName: null,
      updatedAt: "2026-07-20T09:00:00.000Z",
    });
  });

  it("id가 있으면 getNotice(id)를 호출한다", async () => {
    const { wrapper } = createWrapper();

    renderHook(() => useNotice(9), { wrapper });

    await waitFor(() => expect(mocked.getNotice).toHaveBeenCalledWith(9));
  });

  it("id가 null이면 조회하지 않는다", async () => {
    const { wrapper } = createWrapper();

    renderHook(() => useNotice(null), { wrapper });

    await new Promise((r) => setTimeout(r, 0));
    expect(mocked.getNotice).not.toHaveBeenCalled();
  });
});
