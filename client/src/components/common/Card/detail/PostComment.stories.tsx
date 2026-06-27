import type { Meta, StoryObj } from "@storybook/react-vite";

import PostComment from "@/components/common/Card/detail/PostComment";
import { BLOG } from "@/constants/endpoints";
import { mockApi, ok } from "@/__storybook__/mockApi";

const mockComments = [
  {
    id: 1,
    comment: "좋은 글 감사합니다!",
    date: "2026-06-25T09:00:00.000Z",
    parentId: null,
    isDeleted: false,
    user: { id: 99, userName: "다른유저", profileImage: null },
  },
  {
    id: 2,
    comment: "정말 유익한 내용이네요.",
    date: "2026-06-24T09:00:00.000Z",
    parentId: null,
    isDeleted: false,
    user: { id: 98, userName: "또다른유저", profileImage: null },
  },
];

const meta = {
  title: "common/Card/detail/PostComment",
  component: PostComment,
  args: { feedId: 1 },
} satisfies Meta<typeof PostComment>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  name: "댓글 없음",
  beforeEach: () => {
    mockApi.onGet(BLOG.COMMENT.LIST(1)).reply(...ok([]));
    mockApi.onPost(BLOG.COMMENT.LIST(1)).reply(...ok(null));
    mockApi.onPatch(/\/api\/feeds\/1\/comments\/\d+/).reply(...ok(null));
    mockApi.onDelete(/\/api\/feeds\/1\/comments\/\d+/).reply(...ok(null));
  },
};

export const WithComments: Story = {
  name: "댓글 있음",
  beforeEach: () => {
    mockApi.onGet(BLOG.COMMENT.LIST(1)).reply(...ok(mockComments));
    mockApi.onPost(BLOG.COMMENT.LIST(1)).reply(...ok(null));
    mockApi.onPatch(/\/api\/feeds\/1\/comments\/\d+/).reply(...ok(null));
    mockApi.onDelete(/\/api\/feeds\/1\/comments\/\d+/).reply(...ok(null));
  },
};
