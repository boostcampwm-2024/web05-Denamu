import type { Meta, StoryObj } from "@storybook/react-vite";

import { PostCardImage } from "@/components/common/Card/PostCardImage";

const meta = {
  title: "common/Card/PostCardImage",
  component: PostCardImage,
  args: { alt: "썸네일 이미지" },
} satisfies Meta<typeof PostCardImage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
