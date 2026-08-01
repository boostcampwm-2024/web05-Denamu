import type { Meta, StoryObj } from "@storybook/react-vite";

import TrendingSection from "@/components/sections/TrendingSection";
import { mockFeedsList } from "@/__storybook__/fixtures";
import { queryClient } from "@/__storybook__/queryClient";

const meta = {
  title: "sections/TrendingSection",
  component: TrendingSection,
} satisfies Meta<typeof TrendingSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithPosts: Story = {
  name: "트렌딩 포스트 있음",
  beforeEach: () => {
    queryClient.setQueryData(["trending-posts"], { message: "", data: mockFeedsList.slice(0, 4) });
  },
};

export const Empty: Story = {
  name: "트렌딩 포스트 없음",
  beforeEach: () => {
    queryClient.setQueryData(["trending-posts"], { message: "", data: [] });
  },
};
