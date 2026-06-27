import type { Meta, StoryObj } from "@storybook/react-vite";

import { RssFeedRow } from "@/components/profile/rss/RssFeedRow";

const meta = {
  title: "profile/rss/RssFeedRow",
  component: RssFeedRow,
  args: { id: 1, title: "피드 제목", createdAt: "2024-01-15", commentCount: 0, likeCount: 0 },
} satisfies Meta<typeof RssFeedRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
