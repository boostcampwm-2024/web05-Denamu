import type { Meta, StoryObj } from "@storybook/react-vite";

import ChatHistory from "@/components/chat/layout/ChatHistory";

const meta = {
  title: "chat/layout/ChatHistory",
  component: ChatHistory,
  args: { isFull: false, isConnected: true },
} satisfies Meta<typeof ChatHistory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
