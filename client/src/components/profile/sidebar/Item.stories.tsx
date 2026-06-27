import type { Meta, StoryObj } from "@storybook/react-vite";

import { Item } from "@/components/profile/sidebar/Item";
import { mockSidebarIcon } from "@/__storybook__/fixtures";

const meta = {
  title: "profile/sidebar/Item",
  component: Item,
  args: { icon: mockSidebarIcon, label: "프로필", id: "profile" },
} satisfies Meta<typeof Item>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
