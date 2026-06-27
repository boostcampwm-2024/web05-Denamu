import type { Meta, StoryObj } from "@storybook/react-vite";

import EmptyPost from "@/components/common/EmptyPost";

const meta = {
  title: "common/EmptyPost",
  component: EmptyPost,
} satisfies Meta<typeof EmptyPost>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
