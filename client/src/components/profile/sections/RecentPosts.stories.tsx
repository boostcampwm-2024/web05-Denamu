import type { Meta, StoryObj } from "@storybook/react-vite";

import { RecentPosts } from "@/components/profile/sections/RecentPosts";
import { mockUser } from "@/__storybook__/fixtures";

const meta = {
  title: "profile/sections/RecentPosts",
  component: RecentPosts,
  args: { user: mockUser },
} satisfies Meta<typeof RecentPosts>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
