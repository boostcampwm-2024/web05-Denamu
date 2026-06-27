import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { AdminNavigationMenu } from "@/components/admin/layout/AdminNavigationMenu";

const meta = {
  title: "admin/layout/AdminNavigationMenu",
  component: AdminNavigationMenu,
  args: { handleTap: fn() },
} satisfies Meta<typeof AdminNavigationMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
