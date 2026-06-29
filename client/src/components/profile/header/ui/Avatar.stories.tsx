import type { Meta, StoryObj } from "@storybook/react-vite";

import { Avatar } from "@/components/profile/header/ui/Avatar";
import { mockUser } from "@/__storybook__/fixtures";

const meta = {
  title: "profile/header/ui/Avatar",
  component: Avatar,
  args: { user: mockUser },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
