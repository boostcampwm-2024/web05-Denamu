import type { ReactNode } from "react";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { getBoard, getBoards } from "@/api/services/board";
import { useBoard, useBoards } from "@/hooks/queries/useBoards";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

vi.mock("@/api/services/board", () => ({
  getBoards: vi.fn(),
  getBoard: vi.fn(),
}));

const mocked = { getBoards: vi.mocked(getBoards), getBoard: vi.mocked(getBoard) };

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { wrapper };
};

describe("useBoards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocked.getBoards.mockResolvedValue({ result: [], page: 1, limit: 10, totalCount: 0, hasMore: false });
  });

  it("params를 그대로 전달해 getBoards를 호출한다", async () => {
    const { wrapper } = createWrapper();

    renderHook(() => useBoards({ page: 2, limit: 5 }), { wrapper });

    await waitFor(() => expect(mocked.getBoards).toHaveBeenCalledWith({ page: 2, limit: 5 }));
  });

  it("enabled=false이면 조회하지 않는다", async () => {
    const { wrapper } = createWrapper();

    renderHook(() => useBoards({ page: 1, limit: 5 }, false), { wrapper });

    await new Promise((r) => setTimeout(r, 0));
    expect(mocked.getBoards).not.toHaveBeenCalled();
  });
});

describe("useBoard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocked.getBoard.mockResolvedValue({
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

  it("id가 있으면 getBoard(id)를 호출한다", async () => {
    const { wrapper } = createWrapper();

    renderHook(() => useBoard(9), { wrapper });

    await waitFor(() => expect(mocked.getBoard).toHaveBeenCalledWith(9));
  });

  it("id가 null이면 조회하지 않는다", async () => {
    const { wrapper } = createWrapper();

    renderHook(() => useBoard(null), { wrapper });

    await new Promise((r) => setTimeout(r, 0));
    expect(mocked.getBoard).not.toHaveBeenCalled();
  });
});
