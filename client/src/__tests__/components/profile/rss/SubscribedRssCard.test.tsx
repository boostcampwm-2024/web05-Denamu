import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { SubscribedRssCard } from "@/components/profile/rss/SubscribedRssCard.tsx";

import { SubscribedRss } from "@/types/subscription.ts";
import { fireEvent, render, screen } from "@testing-library/react";

const toast = vi.fn();
let toggleState: { mutate: ReturnType<typeof vi.fn>; isPending: boolean };

vi.mock("lucide-react", () => lucideProxy());

vi.mock("@/hooks/common/useCustomToast.ts", () => ({ useCustomToast: () => ({ toast }) }));

vi.mock("@/hooks/queries/useSubscription.ts", () => ({
  useToggleSubscription: () => toggleState,
}));

vi.mock("@/components/profile/rss/PlatformIcon.tsx", () => ({
  PlatformIcon: () => <div data-testid="platform-icon" />,
}));

const rss: SubscribedRss = {
  id: 3,
  name: "구독 블로그",
  userName: "글쓴이",
  rssUrl: "https://blog.test/rss",
  blogPlatform: "velog",
  feedCount: 8,
};

describe("SubscribedRssCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    toggleState = { mutate: vi.fn(), isPending: false };
  });

  it("블로그명, 작성자, URL, 공개 게시글 수를 렌더링해야 한다", () => {
    render(<SubscribedRssCard rss={rss} />);

    expect(screen.getByText("구독 블로그")).toBeInTheDocument();
    expect(screen.getByText("글쓴이")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "https://blog.test/rss" })).toBeInTheDocument();
    expect(screen.getByText(/공개 중인 게시글 8개/)).toBeInTheDocument();
  });

  it("'구독 해제' 클릭 시 isSubscribed=true로 mutate를 호출해야 한다", () => {
    render(<SubscribedRssCard rss={rss} />);

    fireEvent.click(screen.getByRole("button", { name: /구독 해제/ }));

    expect(toggleState.mutate).toHaveBeenCalledWith(true, expect.any(Object));
  });

  it("해제 성공 시 성공 토스트를 띄워야 한다", () => {
    toggleState.mutate.mockImplementation((_v, opts) => opts.onSuccess());
    render(<SubscribedRssCard rss={rss} />);

    fireEvent.click(screen.getByRole("button", { name: /구독 해제/ }));

    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "구독 해제" }));
  });

  it("해제 실패 시 실패 토스트를 띄워야 한다", () => {
    toggleState.mutate.mockImplementation((_v, opts) => opts.onError());
    render(<SubscribedRssCard rss={rss} />);

    fireEvent.click(screen.getByRole("button", { name: /구독 해제/ }));

    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "해제 실패" }));
  });

  it("요청 진행 중이면 버튼이 비활성화되고 클릭해도 mutate를 호출하지 않아야 한다", () => {
    toggleState.isPending = true;
    render(<SubscribedRssCard rss={rss} />);

    const button = screen.getByRole("button", { name: /구독 해제/ });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(toggleState.mutate).not.toHaveBeenCalled();
  });
});
