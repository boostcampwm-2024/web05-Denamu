import type { Meta, StoryObj } from "@storybook/react-vite";

import AnimatedPostGrid from "@/components/sections/AnimatedPostGrid";
import { FeedBase } from "@/types/post";

const meta = {
  title: "sections/AnimatedPostGrid",
  component: AnimatedPostGrid,
  args: {
    posts: [
      {
        id: 1,
        createdAt: "2024-01-15",
        title: "게시글 제목",
        viewCount: 100,
        path: "https://example.com/post",
        thumbnail: "",
        tag: ["React", "TypeScript"],
        likes: 5,
        comments: 2,
        blog: { name: "홍길동", platform: "tistory" },
      },
    ] as FeedBase[],
  },
} satisfies Meta<typeof AnimatedPostGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
