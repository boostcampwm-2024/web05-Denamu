import { NotificationBell } from "@/components/common/NotificationBell";

import { NOTIFICATION } from "@/constants/endpoints";

import { mockApi, ok } from "@/__storybook__/mockApi";
import { useAuthStore } from "@/store/useAuthStore";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

const unreadItem = {
  id: 1,
  type: "LIKE",
  isRead: false,
  updatedAt: "2026-07-26T00:00:00.000Z",
  feed: { id: 10, title: "Storybook으로 알림 미리보기", path: "https://example.com/10" },
  actor: { userName: "댓글러", profileImage: null },
  otherCount: 0,
  commentPreview: null,
  commentId: null,
};

const readItem = {
  id: 2,
  type: "LIKE",
  isRead: true,
  updatedAt: "2026-07-25T00:00:00.000Z",
  feed: { id: 11, title: "이미 읽은 알림 예시", path: "https://example.com/11" },
  actor: { userName: "먼저읽음", profileImage: null },
  otherCount: 0,
  commentPreview: null,
  commentId: null,
};

const multipleLikersItem = {
  id: 3,
  type: "LIKE",
  isRead: false,
  updatedAt: "2026-07-27T00:00:00.000Z",
  feed: { id: 12, title: "여러 명이 좋아요한 게시글", path: "https://example.com/12" },
  actor: { userName: "최신좋아요러", profileImage: null },
  otherCount: 3,
  commentPreview: null,
  commentId: null,
};

const commentItem = {
  id: 4,
  type: "COMMENT",
  isRead: false,
  updatedAt: "2026-07-27T00:00:00.000Z",
  feed: { id: 13, title: "댓글이 달린 게시글", path: "https://example.com/13" },
  actor: { userName: "댓글러", profileImage: null },
  otherCount: 0,
  commentPreview: "저도 이 방법으로 해결했어요, 감사합니다!",
  commentId: 101,
};

const multipleCommentersItem = {
  id: 5,
  type: "COMMENT",
  isRead: false,
  updatedAt: "2026-07-27T00:00:00.000Z",
  feed: { id: 14, title: "여러 명이 댓글단 게시글", path: "https://example.com/14" },
  actor: { userName: "최신댓글러", profileImage: null },
  otherCount: 2,
  commentPreview: "저도 같은 문제 있었는데 이 글 보고 해결했습니다",
  commentId: 102,
};

const replyItem = {
  id: 6,
  type: "REPLY",
  isRead: false,
  updatedAt: "2026-07-28T00:00:00.000Z",
  feed: { id: 15, title: "답글이 달린 댓글이 있는 게시글", path: "https://example.com/15" },
  actor: { userName: "답글러", profileImage: null },
  otherCount: 0,
  commentPreview: "저도 답글로 남겨봅니다!",
  commentId: 103,
};

const multipleRepliersItem = {
  id: 7,
  type: "REPLY",
  isRead: false,
  updatedAt: "2026-07-28T00:00:00.000Z",
  feed: { id: 16, title: "답글이 여러 개 달린 댓글이 있는 게시글", path: "https://example.com/16" },
  actor: { userName: "최신답글러", profileImage: null },
  otherCount: 2,
  commentPreview: "저도 같은 의견입니다",
  commentId: 104,
};

const subscribeItem = {
  id: 4,
  type: "SUBSCRIBE",
  isRead: false,
  updatedAt: "2026-07-28T00:00:00.000Z",
  feed: null,
  rss: { id: 20, name: "denamu.log" },
  actor: { userName: "새구독자", profileImage: null },
  otherCount: 0,
};

const meta = {
  title: "common/NotificationBell",
  component: NotificationBell,
} satisfies Meta<typeof NotificationBell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NotAuthenticated: Story = {
  name: "비로그인",
  beforeEach: () => {
    useAuthStore.setState({ isAuthenticated: false, accessToken: null });
  },
};

export const Empty: Story = {
  name: "알림 없음",
  beforeEach: () => {
    useAuthStore.setState({ isAuthenticated: true, accessToken: "mock-token" });
    mockApi.onGet(NOTIFICATION.UNREAD_COUNT).reply(...ok({ count: 0 }));
    mockApi.onGet(NOTIFICATION.LIST).reply(...ok({ result: [] }));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "알림" }));
    await expect(await body.findByText("알림이 없습니다.")).toBeInTheDocument();
  },
};

export const WithUnread: Story = {
  name: "읽지 않은 알림 표시",
  beforeEach: () => {
    useAuthStore.setState({ isAuthenticated: true, accessToken: "mock-token" });
    mockApi.onGet(NOTIFICATION.UNREAD_COUNT).reply(...ok({ count: 1 }));
    mockApi.onGet(NOTIFICATION.LIST).reply(...ok({ result: [unreadItem, readItem] }));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await expect(await canvas.findByTestId("unread-badge")).toHaveTextContent("1");

    await userEvent.click(canvas.getByRole("button", { name: "알림" }));
    const items = await body.findAllByTestId("notification-item");
    await expect(items[0]).toHaveTextContent("댓글러님이 Storybook으로 알림 미리보기에 좋아요를 표시했습니다.");
    await expect(items[1]).toHaveTextContent("먼저읽음님이 이미 읽은 알림 예시에 좋아요를 표시했습니다.");
  },
};

export const WithMultipleLikers: Story = {
  name: "여러 명이 좋아요",
  beforeEach: () => {
    useAuthStore.setState({ isAuthenticated: true, accessToken: "mock-token" });
    mockApi.onGet(NOTIFICATION.UNREAD_COUNT).reply(...ok({ count: 1 }));
    mockApi.onGet(NOTIFICATION.LIST).reply(...ok({ result: [multipleLikersItem] }));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "알림" }));
    const item = await body.findByTestId("notification-item");
    await expect(item).toHaveTextContent("최신좋아요러님 외 3명이 여러 명이 좋아요한 게시글에 좋아요를 표시했습니다.");
  },
};

export const WithComment: Story = {
  name: "댓글 알림",
  beforeEach: () => {
    useAuthStore.setState({ isAuthenticated: true, accessToken: "mock-token" });
    mockApi.onGet(NOTIFICATION.UNREAD_COUNT).reply(...ok({ count: 1 }));
    mockApi.onGet(NOTIFICATION.LIST).reply(...ok({ result: [commentItem] }));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "알림" }));
    const item = await body.findByTestId("notification-item");
    await expect(item).toHaveTextContent("댓글러님이 댓글이 달린 게시글에 댓글을 남겼습니다.");
    await expect(item).toHaveTextContent("저도 이 방법으로 해결했어요, 감사합니다!");
  },
};

export const WithMultipleCommenters: Story = {
  name: "여러 명이 댓글",
  beforeEach: () => {
    useAuthStore.setState({ isAuthenticated: true, accessToken: "mock-token" });
    mockApi.onGet(NOTIFICATION.UNREAD_COUNT).reply(...ok({ count: 1 }));
    mockApi.onGet(NOTIFICATION.LIST).reply(...ok({ result: [multipleCommentersItem] }));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "알림" }));
    const item = await body.findByTestId("notification-item");
    await expect(item).toHaveTextContent("최신댓글러님 외 2명이 여러 명이 댓글단 게시글에 댓글을 남겼습니다.");
  },
};

export const WithReply: Story = {
  name: "답글 알림",
  beforeEach: () => {
    useAuthStore.setState({ isAuthenticated: true, accessToken: "mock-token" });
    mockApi.onGet(NOTIFICATION.UNREAD_COUNT).reply(...ok({ count: 1 }));
    mockApi.onGet(NOTIFICATION.LIST).reply(...ok({ result: [replyItem] }));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "알림" }));
    const item = await body.findByTestId("notification-item");
    await expect(item).toHaveTextContent("답글러님이 답글이 달린 댓글이 있는 게시글에 답글을 남겼습니다.");
    await expect(item).toHaveTextContent("저도 답글로 남겨봅니다!");
  },
};

export const WithMultipleRepliers: Story = {
  name: "여러 명이 답글",
  beforeEach: () => {
    useAuthStore.setState({ isAuthenticated: true, accessToken: "mock-token" });
    mockApi.onGet(NOTIFICATION.UNREAD_COUNT).reply(...ok({ count: 1 }));
    mockApi.onGet(NOTIFICATION.LIST).reply(...ok({ result: [multipleRepliersItem] }));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "알림" }));
    const item = await body.findByTestId("notification-item");
    await expect(item).toHaveTextContent(
      "최신답글러님 외 2명이 답글이 여러 개 달린 댓글이 있는 게시글에 답글을 남겼습니다.",
    );
  },
};

export const WithSubscribe: Story = {
  name: "구독 알림 표시",
  beforeEach: () => {
    useAuthStore.setState({ isAuthenticated: true, accessToken: "mock-token" });
    mockApi.onGet(NOTIFICATION.UNREAD_COUNT).reply(...ok({ count: 1 }));
    mockApi.onGet(NOTIFICATION.LIST).reply(...ok({ result: [subscribeItem] }));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "알림" }));
    const item = await body.findByTestId("notification-item");
    await expect(item).toHaveTextContent("새구독자님이 denamu.log을(를) 구독했습니다.");
  },
};

export const MarkAsRead: Story = {
  name: "알림 클릭 시 읽음 처리",
  beforeEach: () => {
    useAuthStore.setState({ isAuthenticated: true, accessToken: "mock-token" });
    mockApi.onGet(NOTIFICATION.UNREAD_COUNT).reply(...ok({ count: 1 }));
    mockApi.onGet(NOTIFICATION.LIST).reply(...ok({ result: [unreadItem] }));
    mockApi.onPatch(NOTIFICATION.READ(unreadItem.id)).reply(...ok(null));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "알림" }));
    await userEvent.click(await body.findByTestId("notification-item"));

    await expect(mockApi.history.patch).toHaveLength(1);
    await expect(mockApi.history.patch[0].url).toBe(NOTIFICATION.READ(unreadItem.id));
  },
};
