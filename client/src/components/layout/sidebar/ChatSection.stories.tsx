import type { Meta, StoryObj } from "@storybook/react-vite";

import { ChatSection } from "@/components/layout/sidebar/ChatSection";

const meta = {
  title: "layout/sidebar/ChatSection",
  component: ChatSection,
} satisfies Meta<typeof ChatSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
