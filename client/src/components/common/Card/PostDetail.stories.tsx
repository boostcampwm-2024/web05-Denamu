import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import PostDetail from "@/components/common/Card/PostDetail";
import { BLOG } from "@/constants/endpoints";
import { mockFeedDetail } from "@/__storybook__/fixtures";
import { mockApi, ok, fail } from "@/__storybook__/mockApi";
import { useAuthStore } from "@/store/useAuthStore";

const meta = {
  title: "common/Card/PostDetail",
  component: PostDetail,
  parameters: {
    router: { initialEntries: ["/1"], path: "/:id" },
  },
} satisfies Meta<typeof PostDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

const setupCommentMutations = () => {
  mockApi.onPost(BLOG.COMMENT.LIST(1)).reply(...ok(null));
  mockApi.onPatch(/\/api\/feeds\/1\/comments\/\d+/).reply(...ok(null));
  mockApi.onDelete(/\/api\/feeds\/1\/comments\/\d+/).reply(...ok(null));
  mockApi.onPost(BLOG.LIKE(1)).reply(...ok(null));
  mockApi.onDelete(BLOG.LIKE(1)).reply(...ok(null));
};

export const WithPost: Story = {
  name: "포스트 있음",
  beforeEach: () => {
    mockApi.onGet(`${BLOG.POST}/1`).reply(...ok(mockFeedDetail));
    mockApi.onGet(BLOG.LIKE(1)).reply(...ok({ isLike: false }));
    mockApi.onGet(BLOG.COMMENT.LIST(1)).reply(...ok([]));
    setupCommentMutations();
  },
};

export const WithLiked: Story = {
  name: "좋아요한 포스트 (로그인됨)",
  beforeEach: () => {
    useAuthStore.setState({
      isAuthenticated: true,
      role: "user",
      userInfo: { id: 1, email: "test@test.com", userName: "테스터" },
    });
    mockApi.onGet(`${BLOG.POST}/1`).reply(...ok({ ...mockFeedDetail, likes: 100 }));
    mockApi.onGet(BLOG.LIKE(1)).reply(...ok({ isLike: true }));
    mockApi.onGet(BLOG.COMMENT.LIST(1)).reply(...ok([]));
    setupCommentMutations();
    return () => {
      useAuthStore.setState({
        isAuthenticated: false,
        role: "guest",
        userInfo: { id: null, email: null, userName: null },
      });
    };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: /좋아요/ }));
    await expect(mockApi.history.delete).toHaveLength(1);
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
