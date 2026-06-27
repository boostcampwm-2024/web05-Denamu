import type { Meta, StoryObj } from "@storybook/react-vite";

import ChatItem from "@/components/chat/ChatItem";
import { mockChatItem } from "@/__storybook__/fixtures";

const meta = {
  title: "chat/ChatItem",
  component: ChatItem,
  args: { chatItem: mockChatItem, isSameUser: false },
} satisfies Meta<typeof ChatItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
