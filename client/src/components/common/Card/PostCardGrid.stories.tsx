import { PostCardGrid } from "@/components/common/Card/PostCardGrid";

import { BLOG } from "@/constants/endpoints";

import { mockFeedList } from "@/__storybook__/fixtures";
import { mockApi, ok } from "@/__storybook__/mockApi";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "common/Card/PostCardGrid",
  component: PostCardGrid,
  args: {
    posts: [mockFeedList, { ...mockFeedList, id: 2, isNew: false, title: "TypeScript 5.0 새로운 기능 살펴보기" }],
  },
} satisfies Meta<typeof PostCardGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  beforeEach: () => {
    mockApi.onPost(`${BLOG.POST}/1`).reply(...ok(null));
    mockApi.onPost(`${BLOG.POST}/2`).reply(...ok(null));
  },
};
