import type { ReactNode } from "react";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAllRss } from "@/hooks/queries/useAllRss";

import { getAllRss } from "@/api/services/rss";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

vi.mock("@/api/services/rss", async () => {
  const actual = await vi.importActual<object>("@/api/services/rss");
  return { ...actual, getAllRss: vi.fn() };
});

const mocked = { getAllRss: vi.mocked(getAllRss) };

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { wrapper };
};

describe("useAllRss", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocked.getAllRss.mockResolvedValue({
      message: "성공",
      data: { totalCount: 0, result: [], totalPages: 0 },
    });
  });

  it("page와 limit을 그대로 전달해 getAllRss를 호출한다", async () => {
    const { wrapper } = createWrapper();

    renderHook(() => useAllRss(2, 20), { wrapper });

    await waitFor(() => expect(mocked.getAllRss).toHaveBeenCalledWith(2, 20, undefined));
  });

  it("blogPlatform이 있으면 함께 전달한다", async () => {
    const { wrapper } = createWrapper();

    renderHook(() => useAllRss(1, 20, "velog"), { wrapper });

    await waitFor(() => expect(mocked.getAllRss).toHaveBeenCalledWith(1, 20, "velog"));
  });
});
