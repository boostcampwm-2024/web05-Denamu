import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import Sidebar from "@/components/layout/Sidebar";

const meta = {
  title: "layout/Sidebar",
  component: Sidebar,
  args: { handleRssModal: fn(), handleSidebar: fn() },
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
