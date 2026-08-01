import type { Meta, StoryObj } from "@storybook/react-vite";

import { PostContent } from "@/components/common/Card/detail/PostContent";
import { mockFeedDetail } from "@/__storybook__/fixtures";

const meta = {
  title: "common/Card/detail/PostContent",
  component: PostContent,
  args: { post: mockFeedDetail },
} satisfies Meta<typeof PostContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
