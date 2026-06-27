import type { Meta, StoryObj } from "@storybook/react-vite";

import ChatFooter from "@/components/chat/layout/ChatFooter";

const meta = {
  title: "chat/layout/ChatFooter",
  component: ChatFooter,
} satisfies Meta<typeof ChatFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
