import type { Meta, StoryObj } from "@storybook/react-vite";

import { Sidebar } from "@/components/profile/sidebar/Sidebar";

const meta = {
  title: "profile/sidebar/Sidebar",
  component: Sidebar,
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
