import type { Meta, StoryObj } from "@storybook/react-vite";

import MainContent from "@/components/sections/MainContent";
import { BLOG, TAG } from "@/constants/endpoints";
import { mockFeedsList } from "@/__storybook__/fixtures";
import { mockApi, ok, fail } from "@/__storybook__/mockApi";
import { queryClient } from "@/__storybook__/queryClient";

const meta = {
  title: "sections/MainContent",
  component: MainContent,
} satisfies Meta<typeof MainContent>;

export default meta;
type Story = StoryObj<typeof meta>;

const latestPage = { result: mockFeedsList, hasMore: false, lastId: null };
const trendingData = { message: "성공", data: mockFeedsList.slice(0, 5) };

export const WithData: Story = {
  name: "데이터 있음",
  beforeEach: () => {
    queryClient.setQueryData(["trending-posts"], trendingData);
    mockApi.onGet(BLOG.POST).reply(...ok(latestPage));
    mockApi.onGet(TAG.LIST).reply(...ok([]));
  },
};

export const Empty: Story = {
  name: "데이터 없음",
  beforeEach: () => {
    queryClient.setQueryData(["trending-posts"], { message: "", data: [] });
    mockApi.onGet(BLOG.POST).reply(...ok({ result: [], hasMore: false, lastId: null }));
    mockApi.onGet(TAG.LIST).reply(...ok([]));
  },
};

export const LatestError: Story = {
  name: "최신 포스트 오류",
  beforeEach: () => {
    queryClient.setQueryData(["trending-posts"], trendingData);
    mockApi.onGet(BLOG.POST).reply(...fail());
    mockApi.onGet(TAG.LIST).reply(...ok([]));
  },
};
