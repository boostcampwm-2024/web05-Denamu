import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { NotificationBell } from "@/components/common/NotificationBell";
import { NOTIFICATION } from "@/constants/endpoints";
import { mockApi, ok } from "@/__storybook__/mockApi";
import { useAuthStore } from "@/store/useAuthStore";

const unreadItem = {
  id: 1,
  type: "LIKE",
  isRead: false,
  updatedAt: "2026-07-26T00:00:00.000Z",
  feed: { id: 10, title: "Storybook으로 알림 미리보기", path: "https://example.com/10" },
  actor: { userName: "댓글러", profileImage: null },
  otherCount: 0,
};

const readItem = {
  id: 2,
  type: "LIKE",
  isRead: true,
  updatedAt: "2026-07-25T00:00:00.000Z",
  feed: { id: 11, title: "이미 읽은 알림 예시", path: "https://example.com/11" },
  actor: { userName: "먼저읽음", profileImage: null },
  otherCount: 0,
};

const multipleLikersItem = {
  id: 3,
  type: "LIKE",
  isRead: false,
  updatedAt: "2026-07-27T00:00:00.000Z",
  feed: { id: 12, title: "여러 명이 좋아요한 게시글", path: "https://example.com/12" },
  actor: { userName: "최신좋아요러", profileImage: null },
  otherCount: 3,
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
    await userEvent.click(canvas.getByRole("button", { name: "알림" }));
    await expect(await canvas.findByText("알림이 없습니다.")).toBeInTheDocument();
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
    await expect(await canvas.findByTestId("unread-badge")).toHaveTextContent("1");

    await userEvent.click(canvas.getByRole("button", { name: "알림" }));
    const items = await canvas.findAllByTestId("notification-item");
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
    await userEvent.click(canvas.getByRole("button", { name: "알림" }));
    const item = await canvas.findByTestId("notification-item");
    await expect(item).toHaveTextContent("최신좋아요러님 외 3명이 여러 명이 좋아요한 게시글에 좋아요를 표시했습니다.");
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
    await userEvent.click(canvas.getByRole("button", { name: "알림" }));
    await userEvent.click(await canvas.findByTestId("notification-item"));

    await expect(mockApi.history.patch).toHaveLength(1);
    await expect(mockApi.history.patch[0].url).toBe(NOTIFICATION.READ(unreadItem.id));
  },
};
