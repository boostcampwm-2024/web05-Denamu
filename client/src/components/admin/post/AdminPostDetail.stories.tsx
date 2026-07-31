import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import AdminPostDetail from "@/components/admin/post/AdminPostDetail";
import { ADMIN, BLOG } from "@/constants/endpoints";
import { mockFeedDetail } from "@/__storybook__/fixtures";
import { mockApi, ok, fail } from "@/__storybook__/mockApi";

const meta = {
  title: "admin/post/AdminPostDetail",
  component: AdminPostDetail,
  args: { feedId: 1, onClose: fn() },
} satisfies Meta<typeof AdminPostDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  beforeEach: () => {
    mockApi.onGet(`${BLOG.POST}/1`).reply(...ok(mockFeedDetail));
    mockApi.onGet(BLOG.COMMENT.LIST(1)).reply(...ok([]));
    mockApi.onPost(ADMIN.FEED.AI_SUMMARY(1)).reply(...ok(null));
    mockApi.onDelete(/\/api\/admins\/comments\/\d+/).reply(...ok(null));
  },
};

export const RetrySummary: Story = {
  name: "AI 요약 재시도 클릭",
  beforeEach: () => {
    mockApi.onGet(`${BLOG.POST}/1`).reply(...ok(mockFeedDetail));
    mockApi.onGet(BLOG.COMMENT.LIST(1)).reply(...ok([]));
    mockApi.onPost(ADMIN.FEED.AI_SUMMARY(1)).reply(...ok(null));
    mockApi.onDelete(/\/api\/admins\/comments\/\d+/).reply(...ok(null));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "AI 요약 재시도" }));
    await expect(mockApi.history.post).toHaveLength(1);
  },
};

export const WithComments: Story = {
  name: "댓글 있음",
  beforeEach: () => {
    mockApi.onGet(`${BLOG.POST}/1`).reply(...ok(mockFeedDetail));
    mockApi.onGet(BLOG.COMMENT.LIST(1)).reply(...ok([
      { id: 1, comment: "좋은 글이네요!", date: "2026-06-25T09:00:00.000Z", parentId: null, isDeleted: false, user: { id: 99, userName: "독자", profileImage: null } },
    ]));
    mockApi.onPost(ADMIN.FEED.AI_SUMMARY(1)).reply(...ok(null));
    mockApi.onDelete(/\/api\/admins\/comments\/\d+/).reply(...ok(null));
  },
};

export const Loading: Story = {
  name: "로딩 중",
  beforeEach: () => {
    mockApi.onGet(`${BLOG.POST}/1`).reply(() => new Promise(() => {}));
  },
};

export const Error: Story = {
  name: "오류",
  beforeEach: () => {
    mockApi.onGet(`${BLOG.POST}/1`).reply(...fail(404, "게시글을 찾을 수 없습니다."));
  },
};
