import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import AdminPostTab from "@/components/admin/post/AdminPostTab";
import { ADMIN, BLOG } from "@/constants/endpoints";
import { mockFeedsList, mockNoSummaryFeeds, mockFeedDetail } from "@/__storybook__/fixtures";
import { mockApi, ok, fail } from "@/__storybook__/mockApi";

const meta = {
  title: "admin/post/AdminPostTab",
  component: AdminPostTab,
} satisfies Meta<typeof AdminPostTab>;

export default meta;
type Story = StoryObj<typeof meta>;

const setupSuccess = () => {
  mockApi.onGet(BLOG.POST).reply(...ok({ result: mockFeedsList, hasMore: false, lastId: null }));
  mockApi.onGet(ADMIN.FEED.NO_SUMMARY).reply(...ok(mockNoSummaryFeeds));
  mockApi.onPost(/\/api\/admins\/feeds\/\d+\/ai-summary-requests/).reply(...ok(null));
  // For post detail panel when card is clicked
  mockApi.onGet(/\/api\/feeds\/\d+$/).reply(...ok(mockFeedDetail));
  mockApi.onGet(/\/api\/feeds\/\d+\/comments/).reply(...ok([]));
  mockApi.onDelete(/\/api\/admins\/comments\/\d+/).reply(...ok(null));
};

export const WithPosts: Story = {
  name: "게시글 있음",
  beforeEach: setupSuccess,
};

export const ClickPost: Story = {
  name: "게시글 클릭 → 상세",
  beforeEach: setupSuccess,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const titles = await canvas.findAllByText(mockFeedsList[0].title);
    await userEvent.click(titles[titles.length - 1]);
    await expect(await canvas.findByRole("button", { name: "AI 요약 재시도" })).toBeInTheDocument();
  },
};

export const NoSummaryOnly: Story = {
  name: "AI 요약 없는 게시글만",
  beforeEach: () => {
    mockApi.onGet(BLOG.POST).reply(...ok({ result: [], hasMore: false, lastId: null }));
    mockApi.onGet(ADMIN.FEED.NO_SUMMARY).reply(...ok(mockNoSummaryFeeds));
    mockApi.onPost(/\/api\/admins\/feeds\/\d+\/ai-summary-requests/).reply(...ok(null));
  },
};

export const AllEmpty: Story = {
  name: "게시글 없음",
  beforeEach: () => {
    mockApi.onGet(BLOG.POST).reply(...ok({ result: [], hasMore: false, lastId: null }));
    mockApi.onGet(ADMIN.FEED.NO_SUMMARY).reply(...ok([]));
  },
};

export const Loading: Story = {
  name: "로딩 중",
  beforeEach: () => {
    mockApi.onGet(BLOG.POST).reply(() => new Promise(() => {}));
    mockApi.onGet(ADMIN.FEED.NO_SUMMARY).reply(() => new Promise(() => {}));
  },
};

export const Error: Story = {
  name: "오류",
  beforeEach: () => {
    mockApi.onGet(BLOG.POST).reply(...fail());
    mockApi.onGet(ADMIN.FEED.NO_SUMMARY).reply(...fail());
  },
};
