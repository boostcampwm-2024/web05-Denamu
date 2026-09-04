import type { ReactNode } from "react";

import { describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { CertifiedRssCard } from "@/components/profile/rss/CertifiedRssCard.tsx";

import { CertifiedRss } from "@/types/profile.ts";
import { fireEvent, render, screen } from "@testing-library/react";

vi.mock("lucide-react", () => lucideProxy());

const navigateMock = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => navigateMock,
  Link: ({ to, children, ...props }: { to: string; children: ReactNode }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/hooks/queries/useSubscription.ts", () => ({
  useToggleSubscription: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@/store/useAuthStore.ts", () => ({
  useAuthStore: (selector: (state: { isAuthenticated: boolean }) => unknown) =>
    selector({ isAuthenticated: true }),
}));

vi.mock("@/components/profile/rss/PlatformIcon.tsx", () => ({ PlatformIcon: () => <div data-testid="platform-icon" /> }));

const rss = {
  id: 10,
  name: "내 블로그",
  rssUrl: "https://blog.test",
  blogUrl: "https://blog.test",
  blogPlatform: "velog",
  feedCount: 3,
} as CertifiedRss;

describe("CertifiedRssCard", () => {
  it("블로그명, URL, 게시글 수를 렌더링해야 한다", () => {
    render(<CertifiedRssCard userId={1} rss={rss} isOwner={false} />);

    expect(screen.getByText("내 블로그")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "https://blog.test" })).toBeInTheDocument();
    expect(screen.getByText(/게시글 3개/)).toBeInTheDocument();
  });

  it("블로그명 클릭 시 RSS 정보 페이지(/rss/:id)로 연결되어야 한다", () => {
    render(<CertifiedRssCard userId={1} rss={rss} isOwner={false} />);

    expect(screen.getByRole("link", { name: "내 블로그" })).toHaveAttribute("href", "/rss/10");
  });

  it("카드 클릭 시 RSS 페이지(/rss/:id)로 이동해야 한다", () => {
    render(<CertifiedRssCard userId={1} rss={rss} isOwner={false} />);

    fireEvent.click(screen.getByText(/게시글 3개/));

    expect(navigateMock).toHaveBeenCalledWith("/rss/10");
  });

  it("RSS URL 클릭 시 카드 네비게이션이 발생하지 않아야 한다", () => {
    navigateMock.mockClear();
    render(<CertifiedRssCard userId={1} rss={rss} isOwner={false} />);

    fireEvent.click(screen.getByRole("link", { name: "https://blog.test" }));

    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("게시글 목록을 펼치는 버튼(잔재 기능)이 없어야 한다", () => {
    render(<CertifiedRssCard userId={1} rss={rss} isOwner={false} />);

    expect(screen.queryByRole("button", { name: "게시글 목록 펼치기" })).not.toBeInTheDocument();
  });
});
