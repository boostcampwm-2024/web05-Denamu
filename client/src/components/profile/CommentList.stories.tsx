import type { Meta, StoryObj } from "@storybook/react-vite";

import { CommentList } from "@/components/profile/CommentList";
import { PROFILE } from "@/constants/endpoints";
import { mockCommentItemsPage } from "@/__storybook__/fixtures";
import { mockApi, ok, fail } from "@/__storybook__/mockApi";

const meta = {
  title: "profile/CommentList",
  component: CommentList,
  args: { userId: 1 },
} satisfies Meta<typeof CommentList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithComments: Story = {
  name: "댓글 있음",
  beforeEach: () => {
    mockApi.onGet(PROFILE.COMMENTS(1)).reply(...ok(mockCommentItemsPage));
  },
};

export const WithMorePages: Story = {
  name: "더 보기 있음",
  beforeEach: () => {
    mockApi.onGet(PROFILE.COMMENTS(1)).reply(...ok({ ...mockCommentItemsPage, hasMore: true, lastId: 10 }));
  },
};

export const Loading: Story = {
  name: "로딩 중",
  beforeEach: () => {
    mockApi.onGet(PROFILE.COMMENTS(1)).reply(() => new Promise(() => {}));
  },
};

export const Empty: Story = {
  name: "댓글 없음",
  beforeEach: () => {
    mockApi.onGet(PROFILE.COMMENTS(1)).reply(...ok({ result: [], lastId: 0, hasMore: false }));
  },
};

export const Error: Story = {
  name: "오류",
  beforeEach: () => {
    mockApi.onGet(PROFILE.COMMENTS(1)).reply(...fail());
  },
};
