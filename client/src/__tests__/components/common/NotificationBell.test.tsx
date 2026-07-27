import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { NotificationBell } from "@/components/common/NotificationBell.tsx";
import { NotificationItem } from "@/api/services/notifications";

import { fireEvent, render, screen } from "@testing-library/react";

const mockNavigate = vi.fn();
const markRead = vi.fn();

let authState: { isAuthenticated: boolean };
let listState: { data: NotificationItem[]; isLoading: boolean };
let unreadCount: number;

vi.mock("lucide-react", () => lucideProxy());

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: "/" }),
}));

vi.mock("@/store/useAuthStore", () => ({
  useAuthStore: () => authState,
}));

vi.mock("@/hooks/queries/useNotifications", () => ({
  useUnreadNotificationCount: () => ({ data: unreadCount }),
  useNotificationList: () => listState,
  useMarkNotificationRead: () => ({ mutate: markRead }),
}));

vi.mock("@/components/ui/popover", () => {
  const passthrough = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  return { Popover: passthrough, PopoverTrigger: passthrough, PopoverContent: passthrough };
});

vi.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const makeItem = (overrides: Partial<NotificationItem> = {}): NotificationItem => ({
  id: 1,
  type: "LIKE",
  isRead: false,
  updatedAt: "2026-07-26T00:00:00.000Z",
  feed: { id: 10, title: "테스트 게시글", path: "https://example.com/10" },
  actor: { userName: "liker", profileImage: null },
  otherCount: 0,
  commentPreview: null,
  commentId: null,
  ...overrides,
});

describe("NotificationBell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState = { isAuthenticated: true };
    listState = { data: [], isLoading: false };
    unreadCount = 0;
  });

  it("비인증 상태에서는 아무 것도 렌더링하지 않는다", () => {
    authState.isAuthenticated = false;
    const { container } = render(<NotificationBell />);

    expect(container).toBeEmptyDOMElement();
  });

  it("읽지 않은 알림이 없으면 배지를 표시하지 않는다", () => {
    unreadCount = 0;
    render(<NotificationBell />);

    expect(screen.queryByTestId("unread-badge")).not.toBeInTheDocument();
  });

  it("읽지 않은 알림 개수를 배지로 표시한다", () => {
    unreadCount = 3;
    render(<NotificationBell />);

    expect(screen.getByTestId("unread-badge")).toHaveTextContent("3");
  });

  it("알림이 없으면 안내 문구를 표시한다", () => {
    listState = { data: [], isLoading: false };
    render(<NotificationBell />);

    expect(screen.getByText("알림이 없습니다.")).toBeInTheDocument();
  });

  it("좋아요 알림 메시지를 템플릿에 맞게 표시하고, 유저명/게시글명/행위만 강조한다", () => {
    listState = { data: [makeItem()], isLoading: false };
    render(<NotificationBell />);

    const item = screen.getByTestId("notification-item");
    expect(item).toHaveTextContent("liker님이 테스트 게시글에 좋아요를 표시했습니다.");

    const bolded = item.querySelectorAll(".font-semibold");
    expect(Array.from(bolded).map((el) => el.textContent)).toEqual(["liker", "테스트 게시글", "좋아요"]);
  });

  it("댓글 알림 메시지를 템플릿에 맞게 표시한다", () => {
    listState = {
      data: [makeItem({ type: "COMMENT", actor: { userName: "commenter", profileImage: null } })],
      isLoading: false,
    };
    render(<NotificationBell />);

    const item = screen.getByTestId("notification-item");
    expect(item).toHaveTextContent("commenter님이 테스트 게시글에 댓글을 남겼습니다.");

    const bolded = item.querySelectorAll(".font-semibold");
    expect(Array.from(bolded).map((el) => el.textContent)).toEqual(["commenter", "테스트 게시글", "댓글"]);
  });

  it("댓글 알림에는 댓글 내용 일부를 인용부호로 표시한다", () => {
    listState = {
      data: [makeItem({ type: "COMMENT", commentPreview: "내용 좋네요" })],
      isLoading: false,
    };
    render(<NotificationBell />);

    const item = screen.getByTestId("notification-item");
    expect(item).toHaveTextContent("“내용 좋네요”");
  });

  it("좋아요 알림에는 댓글 내용을 표시하지 않는다", () => {
    listState = { data: [makeItem({ commentPreview: "무시되어야 함" })], isLoading: false };
    render(<NotificationBell />);

    expect(screen.queryByText("“무시되어야 함”")).not.toBeInTheDocument();
  });

  it("다른 좋아요가 더 있으면 '외 N명' 문구를 표시한다", () => {
    listState = { data: [makeItem({ otherCount: 3 })], isLoading: false };
    render(<NotificationBell />);

    const item = screen.getByTestId("notification-item");
    expect(item).toHaveTextContent("liker님 외 3명이 테스트 게시글에 좋아요를 표시했습니다.");
  });

  it("읽지 않은 알림을 클릭하면 읽음 처리 후 게시글로 이동한다", () => {
    listState = { data: [makeItem({ id: 5, isRead: false })], isLoading: false };
    render(<NotificationBell />);

    fireEvent.click(screen.getByTestId("notification-item"));

    expect(markRead).toHaveBeenCalledWith(5);
    expect(mockNavigate).toHaveBeenCalledWith("/10", {
      state: { backgroundLocation: { pathname: "/" }, highlightCommentId: null },
    });
  });

  it("이미 읽은 알림을 클릭하면 읽음 처리를 다시 호출하지 않는다", () => {
    listState = { data: [makeItem({ id: 5, isRead: true })], isLoading: false };
    render(<NotificationBell />);

    fireEvent.click(screen.getByTestId("notification-item"));

    expect(markRead).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/10", {
      state: { backgroundLocation: { pathname: "/" }, highlightCommentId: null },
    });
  });

  it("댓글 알림을 클릭하면 해당 댓글 ID를 하이라이트 상태로 함께 넘긴다", () => {
    listState = {
      data: [makeItem({ id: 5, type: "COMMENT", commentId: 77 })],
      isLoading: false,
    };
    render(<NotificationBell />);

    fireEvent.click(screen.getByTestId("notification-item"));

    expect(mockNavigate).toHaveBeenCalledWith("/10", {
      state: { backgroundLocation: { pathname: "/" }, highlightCommentId: 77 },
    });
  });
});
