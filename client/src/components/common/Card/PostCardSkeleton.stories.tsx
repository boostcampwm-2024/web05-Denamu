import type { Meta, StoryObj } from "@storybook/react-vite";

import { PostCardSkeleton } from "@/components/common/Card/PostCardSkeleton";

const meta = {
  title: "common/Card/PostCardSkeleton",
  component: PostCardSkeleton,
} satisfies Meta<typeof PostCardSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
