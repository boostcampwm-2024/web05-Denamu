import type { Meta, StoryObj } from "@storybook/react-vite";

import LatestSection from "@/components/sections/LatestSection";
import { BLOG } from "@/constants/endpoints";
import { mockFeedsList } from "@/__storybook__/fixtures";
import { mockApi, ok, fail } from "@/__storybook__/mockApi";

const meta = {
  title: "sections/LatestSection",
  component: LatestSection,
} satisfies Meta<typeof LatestSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithPosts: Story = {
  name: "포스트 있음",
  beforeEach: () => {
    mockApi.onGet(BLOG.POST).reply(...ok({ result: mockFeedsList, hasMore: false, lastId: null }));
  },
};

export const WithMorePages: Story = {
  name: "더 보기 있음",
  beforeEach: () => {
    mockApi.onGet(BLOG.POST).reply(...ok({ result: mockFeedsList, hasMore: true, lastId: mockFeedsList[mockFeedsList.length - 1].id }));
  },
};

export const Loading: Story = {
  name: "로딩 중",
  beforeEach: () => {
    mockApi.onGet(BLOG.POST).reply(() => new Promise(() => {}));
  },
};

export const Empty: Story = {
  name: "포스트 없음",
  beforeEach: () => {
    mockApi.onGet(BLOG.POST).reply(...ok({ result: [], hasMore: false, lastId: null }));
  },
};

export const Error: Story = {
  name: "오류",
  beforeEach: () => {
    mockApi.onGet(BLOG.POST).reply(...fail());
  },
};
