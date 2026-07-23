import type { ReactNode } from "react";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { blockUser, getBlockedUsers, unblockUser } from "@/api/services/block";
import { useBlockedUsers, useBlockUser, useUnblockUser } from "@/hooks/queries/useBlock";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

vi.mock("@/api/services/block", () => ({
  getBlockedUsers: vi.fn(),
  blockUser: vi.fn(),
  unblockUser: vi.fn(),
}));

const mockedGetBlockedUsers = vi.mocked(getBlockedUsers);
const mockedBlockUser = vi.mocked(blockUser);
const mockedUnblockUser = vi.mocked(unblockUser);

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
};

describe("useBlockedUsers", () => {
  beforeEach(() => vi.clearAllMocks());

  it("차단 목록을 조회한다", async () => {
    const blockedUsers = [{ userId: 2, userName: "차단유저", profileImage: null, blockedAt: "2025-08-16" }];
    mockedGetBlockedUsers.mockResolvedValue(blockedUsers);
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useBlockedUsers(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(blockedUsers);
  });

  it("enabled=false면 조회하지 않는다", () => {
    const { wrapper } = createWrapper();

    renderHook(() => useBlockedUsers(false), { wrapper });

    expect(mockedGetBlockedUsers).not.toHaveBeenCalled();
  });
});

describe("useBlockUser / useUnblockUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedBlockUser.mockResolvedValue({ message: "ok" });
    mockedUnblockUser.mockResolvedValue({ message: "ok" });
  });

  it("mutate하면 차단 API를 호출한다", async () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useBlockUser(), { wrapper });

    result.current.mutate(7);

    await waitFor(() => expect(mockedBlockUser).toHaveBeenCalledWith(7));
  });

  it("mutate하면 차단 해제 API를 호출한다", async () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useUnblockUser(), { wrapper });

    result.current.mutate(7);

    await waitFor(() => expect(mockedUnblockUser).toHaveBeenCalledWith(7));
  });

  it("차단 성공 시 관련 쿼리 캐시를 invalidate한다", async () => {
    const { queryClient, wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useBlockUser(), { wrapper });

    result.current.mutate(7);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const invalidatedKeys = invalidateSpy.mock.calls.map(([filter]) => filter?.queryKey?.[0]);
    expect(invalidatedKeys).toEqual(
      expect.arrayContaining(["blockedUsers", "userProfile", "comments", "getUserSearch"])
    );
  });

  it("차단 해제 성공 시 관련 쿼리 캐시를 invalidate한다", async () => {
    const { queryClient, wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useUnblockUser(), { wrapper });

    result.current.mutate(7);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const invalidatedKeys = invalidateSpy.mock.calls.map(([filter]) => filter?.queryKey?.[0]);
    expect(invalidatedKeys).toEqual(
      expect.arrayContaining(["blockedUsers", "userProfile", "comments", "getUserSearch"])
    );
  });
});
