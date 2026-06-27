import type { Meta, StoryObj } from "@storybook/react-vite";

import ChatSkeleton from "@/components/chat/layout/ChatSkeleton";

const meta = {
  title: "chat/layout/ChatSkeleton",
  component: ChatSkeleton,
  args: { number: 3 },
} satisfies Meta<typeof ChatSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
