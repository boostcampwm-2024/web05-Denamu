import type { ReactNode } from "react";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { subscriptions } from "@/api/services/subscriptions";
import {
  useToggleSubscription,
  useUserSubscriptions,
  userSubscriptionsKey,
} from "@/hooks/queries/useSubscription";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

vi.mock("@/api/services/subscriptions", () => ({
  subscriptions: {
    byUser: vi.fn(),
    subscribers: vi.fn(),
    create: vi.fn(),
    remove: vi.fn(),
  },
}));

const mocked = vi.mocked(subscriptions);

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
};

describe("useToggleSubscription", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocked.create.mockResolvedValue(undefined);
    mocked.remove.mockResolvedValue(undefined);
  });

  it("isSubscribed=true로 mutate하면 구독 해제(remove)를 호출한다", async () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useToggleSubscription(5), { wrapper });

    result.current.mutate(true);

    await waitFor(() => expect(mocked.remove).toHaveBeenCalledWith(5));
    expect(mocked.create).not.toHaveBeenCalled();
  });

  it("isSubscribed=false로 mutate하면 구독 등록(create)을 호출한다", async () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useToggleSubscription(5), { wrapper });

    result.current.mutate(false);

    await waitFor(() => expect(mocked.create).toHaveBeenCalledWith(5));
    expect(mocked.remove).not.toHaveBeenCalled();
  });

  it("완료 후 구독 목록·구독 피드·전달된 invalidateKeys 캐시를 무효화한다", async () => {
    const { queryClient, wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const extraKey = ["certifiedRss", 1];

    const { result } = renderHook(() => useToggleSubscription(5, [extraKey]), { wrapper });

    result.current.mutate(false);

    await waitFor(() => expect(mocked.create).toHaveBeenCalled());
    await waitFor(() =>
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: userSubscriptionsKey })
    );
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["subscriptionFeed"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: extraKey });
  });
});

describe("useUserSubscriptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("userId가 유효하면 byUser를 호출한다", async () => {
    mocked.byUser.mockResolvedValue([]);
    const { wrapper } = createWrapper();

    renderHook(() => useUserSubscriptions(7), { wrapper });

    await waitFor(() => expect(mocked.byUser).toHaveBeenCalledWith(7));
  });

  it("userId가 0 이하이면 조회하지 않는다", async () => {
    mocked.byUser.mockResolvedValue([]);
    const { wrapper } = createWrapper();

    renderHook(() => useUserSubscriptions(0), { wrapper });

    await new Promise((r) => setTimeout(r, 0));
    expect(mocked.byUser).not.toHaveBeenCalled();
  });

  it("enabled=false이면 조회하지 않는다", async () => {
    mocked.byUser.mockResolvedValue([]);
    const { wrapper } = createWrapper();

    renderHook(() => useUserSubscriptions(7, false), { wrapper });

    await new Promise((r) => setTimeout(r, 0));
    expect(mocked.byUser).not.toHaveBeenCalled();
  });
});
