import { PostCard } from "@/components/common/Card/PostCard";

import { BLOG } from "@/constants/endpoints";

import { mockFeedList } from "@/__storybook__/fixtures";
import { mockApi, ok } from "@/__storybook__/mockApi";
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta = {
  title: "common/Card/PostCard",
  component: PostCard,
  args: { post: mockFeedList },
} satisfies Meta<typeof PostCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  beforeEach: () => {
    mockApi.onPost(`${BLOG.POST}/${mockFeedList.id}`).reply(...ok(null));
  },
};
