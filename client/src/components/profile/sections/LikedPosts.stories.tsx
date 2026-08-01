import type { Meta, StoryObj } from "@storybook/react-vite";

import { LikedPosts } from "@/components/profile/sections/LikedPosts";

const meta = {
  title: "profile/sections/LikedPosts",
  component: LikedPosts,
} satisfies Meta<typeof LikedPosts>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
