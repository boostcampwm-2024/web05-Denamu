import type { Meta, StoryObj } from "@storybook/react-vite";

import { PostHeader } from "@/components/common/Card/detail/PostHeader";
import { mockFeedDetail } from "@/__storybook__/fixtures";

const meta = {
  title: "common/Card/detail/PostHeader",
  component: PostHeader,
  args: { data: mockFeedDetail },
} satisfies Meta<typeof PostHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
