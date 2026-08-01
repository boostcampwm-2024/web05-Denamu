import type { Meta, StoryObj } from "@storybook/react-vite";

import { RssFeedCard } from "@/components/profile/rss/RssFeedCard";

const meta = {
  title: "profile/rss/RssFeedCard",
  component: RssFeedCard,
  args: {
    id: 1,
    title: "RSS 기반 기술 블로그 큐레이션 플랫폼 만들기",
    thumbnail: "https://picsum.photos/seed/denamu/240/160",
    createdAt: "2025-01-15",
    commentCount: 4,
    likeCount: 12,
  },
} satisfies Meta<typeof RssFeedCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
