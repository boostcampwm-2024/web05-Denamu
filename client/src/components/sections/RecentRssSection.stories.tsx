import type { Meta, StoryObj } from "@storybook/react-vite";

import RecentRssSection from "@/components/sections/RecentRssSection";
import { BLOG } from "@/constants/endpoints";
import { makeRecentRssList } from "@/__storybook__/fixtures";
import { mockApi, ok, fail } from "@/__storybook__/mockApi";

const meta = {
  title: "sections/RecentRssSection",
  component: RecentRssSection,
} satisfies Meta<typeof RecentRssSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MixedStories: Story = {
  name: "스토리 혼합 (24시간 이내/이후)",
  beforeEach: () => {
    mockApi.onGet(BLOG.RSS.RECENT).reply(...ok(makeRecentRssList(10, (i) => (i % 2 === 0 ? i + 1 : 48))));
  },
};

export const AllStories: Story = {
  name: "전체 스토리 (24시간 이내)",
  beforeEach: () => {
    mockApi.onGet(BLOG.RSS.RECENT).reply(...ok(makeRecentRssList(10, (i) => i + 1)));
  },
};

export const NoStories: Story = {
  name: "스토리 없음 (24시간 경과)",
  beforeEach: () => {
    mockApi.onGet(BLOG.RSS.RECENT).reply(...ok(makeRecentRssList(10, (i) => 48 + i)));
  },
};

export const FewItems: Story = {
  name: "항목 적음",
  beforeEach: () => {
    mockApi.onGet(BLOG.RSS.RECENT).reply(...ok(makeRecentRssList(3, (i) => (i === 0 ? 1 : 48))));
  },
};

export const Loading: Story = {
  name: "로딩 중",
  beforeEach: () => {
    mockApi.onGet(BLOG.RSS.RECENT).reply(() => new Promise(() => {}));
  },
};

export const Empty: Story = {
  name: "목록 없음",
  beforeEach: () => {
    mockApi.onGet(BLOG.RSS.RECENT).reply(...ok([]));
  },
};

export const Error: Story = {
  name: "오류",
  beforeEach: () => {
    mockApi.onGet(BLOG.RSS.RECENT).reply(...fail());
  },
};
