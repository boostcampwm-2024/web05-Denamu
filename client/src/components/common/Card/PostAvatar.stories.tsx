import type { Meta, StoryObj } from "@storybook/react-vite";

import PostAvatar from "@/components/common/Card/PostAvatar";

const meta = {
  title: "common/Card/PostAvatar",
  component: PostAvatar,
  args: { author: "홍길동", className: "", blogPlatform: "tistory" },
} satisfies Meta<typeof PostAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
