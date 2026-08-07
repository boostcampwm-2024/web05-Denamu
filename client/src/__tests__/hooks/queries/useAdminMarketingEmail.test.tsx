import type { ReactNode } from "react";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAdminMarketingEmails, useSendMarketingEmail } from "@/hooks/queries/useAdminMarketingEmail";

import { adminMarketingEmail } from "@/api/services/admin/marketingEmail";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

vi.mock("@/api/services/admin/marketingEmail", () => ({
  adminMarketingEmail: {
    getList: vi.fn(),
    send: vi.fn(),
    uploadImage: vi.fn(),
  },
}));

const mocked = vi.mocked(adminMarketingEmail);

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
};

describe("useAdminMarketingEmails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocked.getList.mockResolvedValue({ result: [], page: 1, limit: 10, totalCount: 0, hasMore: false });
  });

  it("params를 그대로 전달해 adminMarketingEmail.getList를 호출한다", async () => {
    const { wrapper } = createWrapper();

    renderHook(() => useAdminMarketingEmails({ page: 2, limit: 10 }), { wrapper });

    await waitFor(() => expect(mocked.getList).toHaveBeenCalledWith({ page: 2, limit: 10 }));
  });
});

describe("useSendMarketingEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocked.send.mockResolvedValue({
      id: 1,
      subject: "새 소식",
      recipientCount: 120,
      authorName: "관리자",
      createdAt: "2026-07-20T09:00:00.000Z",
    });
  });

  it("mutate 시 adminMarketingEmail.send를 호출하고 성공하면 adminMarketingEmails 캐시를 무효화한다", async () => {
    const { queryClient, wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useSendMarketingEmail(), { wrapper });

    result.current.mutate({ subject: "새 소식", content: "<p>내용</p>" });

    await waitFor(() => expect(mocked.send).toHaveBeenCalledWith({ subject: "새 소식", content: "<p>내용</p>" }));
    await waitFor(() => expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["adminMarketingEmails"] }));
  });
});
