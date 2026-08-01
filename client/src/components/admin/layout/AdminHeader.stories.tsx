import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { AdminHeader } from "@/components/admin/layout/AdminHeader";

const meta = {
  title: "admin/layout/AdminHeader",
  component: AdminHeader,
  args: { setLogin: fn(), handleTap: fn() },
} satisfies Meta<typeof AdminHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
