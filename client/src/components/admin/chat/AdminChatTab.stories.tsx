import type { Meta, StoryObj } from "@storybook/react-vite";
import { action } from "storybook/actions";
import { fn } from "storybook/test";

import AdminChatTab from "@/components/admin/chat/AdminChatTab";
import { ADMIN } from "@/constants/endpoints";
import { mockAdminChatMessages, mockAdminChatRooms } from "@/__storybook__/fixtures";
import { mockApi, ok, fail } from "@/__storybook__/mockApi";

const meta = {
  title: "admin/chat/AdminChatTab",
  component: AdminChatTab,
} satisfies Meta<typeof AdminChatTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithRooms: Story = {
  name: "채팅방 있음",
  beforeEach: () => {
    const origConfirm = window.confirm;
    window.confirm = fn().mockReturnValue(true) as never;
    mockApi.onGet(ADMIN.CHAT.ROOMS).reply(...ok(mockAdminChatRooms));
    mockAdminChatRooms.forEach((room) => {
      mockApi.onGet(ADMIN.CHAT.MESSAGES(room.roomId)).reply(...ok(mockAdminChatMessages));
    });
    mockApi.onDelete(/\/api\/admins\/chats\/[^/]+\/[^/]+/).reply(...ok(null));
    return () => { window.confirm = origConfirm; };
  },
};

export const DeleteMessage: Story = {
  name: "채팅 삭제",
  beforeEach: () => {
    const origConfirm = window.confirm;
    // Show the real native confirm dialog; log an action when OK is pressed.
    window.confirm = ((message?: string) => {
      const confirmed = origConfirm(message);
      if (confirmed) action("채팅 삭제 확인")(message);
      return confirmed;
    }) as never;
    mockApi.onGet(ADMIN.CHAT.ROOMS).reply(...ok(mockAdminChatRooms));
    mockAdminChatRooms.forEach((room) => {
      mockApi.onGet(ADMIN.CHAT.MESSAGES(room.roomId)).reply(...ok(mockAdminChatMessages));
    });
    mockApi.onDelete(/\/api\/admins\/chats\/[^/]+\/[^/]+/).reply(...ok(null));
    return () => { window.confirm = origConfirm; };
  },
};

export const Loading: Story = {
  name: "로딩 중",
  beforeEach: () => {
    mockApi.onGet(ADMIN.CHAT.ROOMS).reply(() => new Promise(() => {}));
  },
};

export const NoRooms: Story = {
  name: "채팅방 없음",
  beforeEach: () => {
    mockApi.onGet(ADMIN.CHAT.ROOMS).reply(...ok([]));
  },
};

export const Error: Story = {
  name: "오류",
  beforeEach: () => {
    mockApi.onGet(ADMIN.CHAT.ROOMS).reply(...fail());
  },
};
