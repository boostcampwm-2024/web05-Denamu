import type { ReactNode } from "react";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useTrendingPosts } from "@/hooks/queries/useTrendingPosts";

import { useAuthStore } from "@/store/useAuthStore";
import { BlockedRss } from "@/types/profile";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";

let blockedRssState: BlockedRss[];

vi.mock("@/hooks/queries/useBlock", () => ({
  useBlockedRss: (enabled: boolean) => ({ data: enabled ? blockedRssState : undefined }),
}));

let esInstance: MockEventSource | null = null;

class MockEventSource {
  onmessage: ((event: { data: string }) => void) | null = null;
  close = vi.fn();

  constructor(public url: string) {
    setInstance(this);
  }
}

function setInstance(instance: MockEventSource) {
  esInstance = instance;
}

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
};

const makePost = (id: number, author: string) => ({ id, author, title: `post ${id}` });

describe("useTrendingPosts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    esInstance = null;
    blockedRssState = [];
    useAuthStore.setState({ isAuthenticated: false });
    vi.stubGlobal("EventSource", MockEventSource);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("SSE로 수신한 트렌딩 포스트를 반환한다", async () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useTrendingPosts(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    act(() => {
      esInstance?.onmessage?.({
        data: JSON.stringify({ message: "", data: [makePost(1, "블로그A"), makePost(2, "블로그B")] }),
      });
    });

    await waitFor(() => expect(result.current.posts).toHaveLength(2));
  });

  it("로그인 상태면 차단한 RSS의 포스트를 필터링한다", async () => {
    useAuthStore.setState({ isAuthenticated: true });
    blockedRssState = [{ rssId: 5, name: "블로그B", blogPlatform: "velog", blockedAt: "2025-08-16", blogImage: null }];
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useTrendingPosts(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    act(() => {
      esInstance?.onmessage?.({
        data: JSON.stringify({ message: "", data: [makePost(1, "블로그A"), makePost(2, "블로그B")] }),
      });
    });

    await waitFor(() => expect(result.current.posts).toHaveLength(1));
    expect(result.current.posts[0].author).toBe("블로그A");
  });

  it("unmount 시 EventSource 연결을 닫는다", () => {
    const { wrapper } = createWrapper();
    const { unmount } = renderHook(() => useTrendingPosts(), { wrapper });

    unmount();

    expect(esInstance?.close).toHaveBeenCalled();
  });
});
