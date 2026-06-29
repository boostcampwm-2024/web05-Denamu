import type { Meta, StoryObj } from "@storybook/react-vite";

import ChatButton from "@/components/chat/ChatButton";

const meta = {
  title: "chat/ChatButton",
  component: ChatButton,
} satisfies Meta<typeof ChatButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
