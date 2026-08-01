import type { Meta, StoryObj } from "@storybook/react-vite";

import PostCardContent from "@/components/common/Card/PostCardContent";
import { mockFeedList } from "@/__storybook__/fixtures";

const meta = {
  title: "common/Card/PostCardContent",
  component: PostCardContent,
  args: { post: mockFeedList },
} satisfies Meta<typeof PostCardContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
