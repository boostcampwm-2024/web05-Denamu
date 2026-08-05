import { MemoryRouter } from "react-router-dom";

import { describe, expect, it, vi } from "vitest";

import { PostHeader } from "@/components/common/Card/detail/PostHeader.tsx";

import { FeedDetail } from "@/types/post.ts";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockBlockRss = vi.fn().mockResolvedValue(undefined);
const mockToast = vi.fn();
const mockReportFeed = vi.fn(
  (_vars: unknown, options?: { onSuccess?: () => void; onError?: (error: unknown) => void }) => options?.onSuccess?.()
);

vi.mock("@/components/common/Card/detail/SubscribeButton", () => ({
  SubscribeButton: () => <button>구독</button>,
}));

vi.mock("@/hooks/queries/useReport", () => ({
  useReportFeed: () => ({ mutate: mockReportFeed, isPending: false }),
}));
vi.mock("@/hooks/queries/useBlock", () => ({
  useBlockRss: () => ({ mutateAsync: mockBlockRss }),
}));
vi.mock("@/hooks/common/useCustomToast", () => ({ useCustomToast: () => ({ toast: mockToast }) }));
vi.mock("@/store/useAuthStore", () => ({
  useAuthStore: (selector: (s: { isAuthenticated: boolean }) => unknown) => selector({ isAuthenticated: true }),
}));
vi.mock("lucide-react", async () => {
  const { lucideProxy } = await import("@/__tests__/__mocks__/external/lucide-proxy.tsx");
  return lucideProxy();
});
vi.mock("@/components/ui/select", () => {
  const pass = ({ children }: { children: React.ReactNode }) => <>{children}</>;
  return {
    Select: ({ children, onValueChange }: { children: React.ReactNode; onValueChange: (value: string) => void }) => (
      <div
        onClick={(event) => {
          const value = (event.target as HTMLElement).getAttribute("data-value");
          if (value) onValueChange(value);
        }}
      >
        {children}
      </div>
    ),
    SelectContent: pass,
    SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
      <div role="option" data-value={value}>
        {children}
      </div>
    ),
    SelectTrigger: pass,
    SelectValue: () => null,
  };
});

const data = {
  id: 1,
  title: "상세 제목",
  blog: { id: 42, name: "작성자", ownerName: null, isOwnerCertified: false, platform: "velog", image: null },
  createdAt: "2024-03-26T00:00:00Z",
  viewCount: 123,
  tag: ["React", "Test"],
  path: "/p",
  thumbnail: "",
  likes: 0,
  comments: 0,
} as unknown as FeedDetail;

describe("PostHeader", () => {
  it("제목, 작성자, 조회수를 렌더링해야 한다", () => {
    render(
      <MemoryRouter>
        <PostHeader data={data} />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "상세 제목" })).toBeInTheDocument();
    expect(screen.getByText("작성자")).toBeInTheDocument();
    expect(screen.getByText("123 views")).toBeInTheDocument();
  });

  it("태그 목록을 렌더링해야 한다", () => {
    render(
      <MemoryRouter>
        <PostHeader data={data} />
      </MemoryRouter>
    );

    expect(screen.getByText(/React/)).toBeInTheDocument();
    expect(screen.getByText(/Test/)).toBeInTheDocument();
  });

  it("프로필 영역이 RSS 정보 페이지(/rss/:blogId)로 연결되어야 한다", () => {
    render(
      <MemoryRouter>
        <PostHeader data={data} />
      </MemoryRouter>
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/rss/42");
    expect(link).toHaveTextContent("작성자");
  });

  const openReportModal = async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <PostHeader data={data} />
      </MemoryRouter>
    );
    await user.click(screen.getByRole("button", { name: "더보기" }));
    await user.click(await screen.findByText("신고하기"));
    return user;
  };

  it("함께 차단하기 스위치를 켜지 않으면 게시글만 신고해야 한다", async () => {
    const user = await openReportModal();
    await user.click(screen.getByText("스팸/광고"));
    await user.click(screen.getByRole("button", { name: "신고하기" }));

    expect(mockReportFeed).toHaveBeenCalledWith(
      { feedId: 1, payload: { reason: "SPAM", detail: undefined } },
      expect.anything()
    );
    expect(mockBlockRss).not.toHaveBeenCalled();
  });

  it("함께 차단하기 스위치를 켜면 게시글 신고 후 블로그(RSS)를 차단해야 한다", async () => {
    const user = await openReportModal();
    await user.click(screen.getByText("스팸/광고"));
    await user.click(screen.getByRole("switch"));
    await user.click(screen.getByRole("button", { name: "신고하기" }));

    await waitFor(() => expect(mockBlockRss).toHaveBeenCalledWith(42));
  });

  it("이미 신고한 게시글을 다시 신고하면 중복 신고 안내 토스트를 보여준다", async () => {
    mockReportFeed.mockImplementationOnce((_vars, options) =>
      options?.onError?.({
        isAxiosError: true,
        response: { status: 409, data: { message: "이미 신고한 대상입니다." } },
      })
    );
    const user = await openReportModal();
    await user.click(screen.getByText("스팸/광고"));
    await user.click(screen.getByRole("button", { name: "신고하기" }));

    expect(mockToast).toHaveBeenCalledWith({ title: "신고 실패", description: "이미 신청된 신고입니다." });
  });

  it("존재하지 않는 게시글을 신고하면 찾을 수 없다는 토스트를 보여준다", async () => {
    mockReportFeed.mockImplementationOnce((_vars, options) =>
      options?.onError?.({
        isAxiosError: true,
        response: { status: 404, data: { message: "존재하지 않는 게시글입니다." } },
      })
    );
    const user = await openReportModal();
    await user.click(screen.getByText("스팸/광고"));
    await user.click(screen.getByRole("button", { name: "신고하기" }));

    expect(mockToast).toHaveBeenCalledWith({ title: "신고 실패", description: "게시글을 찾을 수 없습니다." });
  });

  it("그 외 오류로 신고에 실패하면 서버 오류 토스트를 보여준다", async () => {
    mockReportFeed.mockImplementationOnce((_vars, options) =>
      options?.onError?.({ isAxiosError: true, response: { status: 500, data: { message: "Internal Server Error" } } })
    );
    const user = await openReportModal();
    await user.click(screen.getByText("스팸/광고"));
    await user.click(screen.getByRole("button", { name: "신고하기" }));

    expect(mockToast).toHaveBeenCalledWith({
      title: "신고 실패",
      description: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
    });
  });
});
