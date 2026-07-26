import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import PostComment from "@/components/common/Card/detail/PostComment";
import { BLOG, REPORT } from "@/constants/endpoints";
import { mockApi, ok } from "@/__storybook__/mockApi";
import { useAuthStore } from "@/store/useAuthStore";

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

const resetAuth = () => {
  useAuthStore.setState({
    isAuthenticated: false,
    role: "guest",
    userInfo: { id: null, email: null, userName: null },
  });
};

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

export const ReportFlow: Story = {
  name: "댓글 신고하기 플로우 (로그인 방문자)",
  beforeEach: () => {
    useAuthStore.setState({
      isInitialized: true,
      isAuthenticated: true,
      role: "user",
      userInfo: { id: 1, email: "me@test.com", userName: "테스터" },
    });
    mockApi.onGet(BLOG.COMMENT.LIST(1)).reply(...ok(mockComments));
    mockApi.onPost(BLOG.COMMENT.LIST(1)).reply(...ok(null));
    mockApi.onPost(REPORT.COMMENT(mockComments[0].id)).reply(...ok(null));
    return resetAuth;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click((await canvas.findAllByRole("button", { name: "댓글 옵션" }))[0]);
    await userEvent.click(await body.findByRole("menuitem", { name: "신고하기" }));
    await userEvent.click(await body.findByRole("combobox"));
    await userEvent.click(await body.findByRole("option", { name: "기타" }));
    await userEvent.click(await body.findByRole("button", { name: "신고하기" }));

    await waitFor(() => expect(mockApi.history.post).toHaveLength(1));
  },
};
