import type { ReactNode } from "react";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { adminNotice } from "@/api/services/admin/notice";
import {
  useAdminNotices,
  useCreateNotice,
  useDeleteNotice,
  useUpdateNotice,
} from "@/hooks/queries/useAdminNotices";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

vi.mock("@/api/services/admin/notice", () => ({
  adminNotice: {
    getList: vi.fn(),
    getDetail: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

const mocked = vi.mocked(adminNotice);

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
};

describe("useAdminNotices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocked.getList.mockResolvedValue({ result: [], page: 1, limit: 10, totalCount: 0, hasMore: false });
  });

  it("params를 그대로 전달해 adminNotice.getList를 호출한다", async () => {
    const { wrapper } = createWrapper();

    renderHook(() => useAdminNotices({ page: 1, limit: 10, status: "DRAFT" }), { wrapper });

    await waitFor(() =>
      expect(mocked.getList).toHaveBeenCalledWith({ page: 1, limit: 10, status: "DRAFT" })
    );
  });
});

describe("useCreateNotice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocked.create.mockResolvedValue({
      id: 1,
      title: "새 공지",
      content: "<p>내용</p>",
      isPinned: false,
      status: "DRAFT",
      startAt: null,
      endAt: null,
      createdAt: "2026-07-20T09:00:00.000Z",
      authorName: null,
      updatedAt: "2026-07-20T09:00:00.000Z",
    });
  });

  it("mutate 시 adminNotice.create를 호출하고 성공하면 adminNotices 캐시를 무효화한다", async () => {
    const { queryClient, wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useCreateNotice(), { wrapper });

    result.current.mutate({ title: "새 공지", content: "<p>내용</p>" });

    await waitFor(() => expect(mocked.create).toHaveBeenCalledWith({ title: "새 공지", content: "<p>내용</p>" }));
    await waitFor(() => expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["adminNotices"] }));
  });
});

describe("useUpdateNotice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocked.update.mockResolvedValue({
      id: 1,
      title: "수정된 공지",
      content: "<p>내용</p>",
      isPinned: false,
      status: "PUBLISHED",
      startAt: null,
      endAt: null,
      createdAt: "2026-07-20T09:00:00.000Z",
      authorName: null,
      updatedAt: "2026-07-20T09:00:00.000Z",
    });
  });

  it("mutate 시 {id, payload}로 adminNotice.update를 호출하고 성공하면 adminNotices 캐시를 무효화한다", async () => {
    const { queryClient, wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useUpdateNotice(), { wrapper });

    result.current.mutate({ id: 1, payload: { title: "수정된 공지" } });

    await waitFor(() => expect(mocked.update).toHaveBeenCalledWith(1, { title: "수정된 공지" }));
    await waitFor(() => expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["adminNotices"] }));
  });
});

describe("useDeleteNotice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocked.remove.mockResolvedValue(undefined);
  });

  it("mutate 시 id로 adminNotice.remove를 호출하고 성공하면 adminNotices 캐시를 무효화한다", async () => {
    const { queryClient, wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useDeleteNotice(), { wrapper });

    result.current.mutate(1);

    await waitFor(() => expect(mocked.remove).toHaveBeenCalledWith(1));
    await waitFor(() => expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["adminNotices"] }));
  });
});
