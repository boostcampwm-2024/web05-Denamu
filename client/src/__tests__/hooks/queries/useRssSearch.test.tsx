import type { ReactNode } from "react";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { useRssSearch } from "@/hooks/queries/useRssSearch";

import { RssSearchResponse } from "@/types/search";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

const getRssSearch = vi.fn();

vi.mock("@/api/services/search", () => ({
  getRssSearch: (...args: unknown[]) => getRssSearch(...args),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return wrapper;
};

const makeResponse = (result: RssSearchResponse["data"]["result"]): RssSearchResponse => ({
  message: "",
  data: { totalCount: result.length, result, totalPages: 1 },
});

describe("useRssSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getRssSearch.mockResolvedValue(makeResponse([]));
  });

  it("검색어가 비어 있으면 API를 호출하지 않는다.", () => {
    const wrapper = createWrapper();
    renderHook(() => useRssSearch({ query: "", page: 1, pageSize: 5 }), { wrapper });

    expect(getRssSearch).not.toHaveBeenCalled();
  });

  it("마운트 시 검색어가 있으면 즉시 API를 호출한다.", async () => {
    const wrapper = createWrapper();
    renderHook(() => useRssSearch({ query: "seok3765", page: 1, pageSize: 5 }), { wrapper });

    await waitFor(() =>
      expect(getRssSearch).toHaveBeenCalledWith({ query: "seok3765", page: 1, pageSize: 5 }),
    );
  });

  it("검색어 변경은 300ms 디바운스된 후에만 API를 호출한다.", async () => {
    const wrapper = createWrapper();
    const { rerender } = renderHook(({ query }) => useRssSearch({ query, page: 1, pageSize: 5 }), {
      wrapper,
      initialProps: { query: "seok" },
    });

    await waitFor(() => expect(getRssSearch).toHaveBeenCalledTimes(1));

    rerender({ query: "seok3765" });

    // 디바운스 대기 중에는 추가 호출이 없어야 한다.
    expect(getRssSearch).toHaveBeenCalledTimes(1);

    await waitFor(
      () => expect(getRssSearch).toHaveBeenLastCalledWith({ query: "seok3765", page: 1, pageSize: 5 }),
      { timeout: 1000 },
    );
    expect(getRssSearch).toHaveBeenCalledTimes(2);
  });

  it("연속으로 검색어가 바뀌면 마지막 값으로만 호출한다.", async () => {
    const wrapper = createWrapper();
    const { rerender } = renderHook(({ query }) => useRssSearch({ query, page: 1, pageSize: 5 }), {
      wrapper,
      initialProps: { query: "s" },
    });

    await waitFor(() => expect(getRssSearch).toHaveBeenCalledTimes(1));

    rerender({ query: "se" });
    rerender({ query: "seo" });

    await waitFor(
      () => expect(getRssSearch).toHaveBeenLastCalledWith({ query: "seo", page: 1, pageSize: 5 }),
      { timeout: 1000 },
    );
    expect(getRssSearch).toHaveBeenCalledTimes(2);
  });

  it("API 응답을 data로 반환한다.", async () => {
    const response = makeResponse([
      { id: 1, name: "seok3765.log", blogPlatform: "velog", blogImage: null, feedCount: 5 },
    ]);
    getRssSearch.mockResolvedValue(response);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useRssSearch({ query: "seok3765", page: 1, pageSize: 5 }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.data).toEqual(response));
  });
});
