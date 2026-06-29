import type { Meta, StoryObj } from "@storybook/react-vite";

import ChatSection from "@/components/chat/layout/ChatSection";

const meta = {
  title: "chat/layout/ChatSection",
  component: ChatSection,
  args: { isFull: false, isConnected: true },
} satisfies Meta<typeof ChatSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
