import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import LikeButton from "@/components/common/Card/detail/LikeButton";
import { BLOG } from "@/constants/endpoints";
import { mockFeedDetail } from "@/__storybook__/fixtures";
import { mockApi, ok } from "@/__storybook__/mockApi";
import { useAuthStore } from "@/store/useAuthStore";

const meta = {
  title: "common/Card/detail/LikeButton",
  component: LikeButton,
  args: { post: mockFeedDetail },
} satisfies Meta<typeof LikeButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NotLiked: Story = {
  name: "좋아요 안 함 (로그인)",
  beforeEach: () => {
    useAuthStore.setState({ isAuthenticated: true, accessToken: "mock-token" });
    mockApi.onGet(BLOG.LIKE(mockFeedDetail.id)).reply(...ok({ isLike: false }));
    mockApi.onPost(BLOG.LIKE(mockFeedDetail.id)).reply(...ok(null));
    mockApi.onDelete(BLOG.LIKE(mockFeedDetail.id)).reply(...ok(null));
  },
};

export const ClickLike: Story = {
  name: "좋아요 클릭 (로그인)",
  beforeEach: () => {
    useAuthStore.setState({ isAuthenticated: true, accessToken: "mock-token" });
    mockApi.onGet(BLOG.LIKE(mockFeedDetail.id)).reply(...ok({ isLike: false }));
    mockApi.onPost(BLOG.LIKE(mockFeedDetail.id)).reply(...ok(null));
    mockApi.onDelete(BLOG.LIKE(mockFeedDetail.id)).reply(...ok(null));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: /좋아요/ }));
    await expect(mockApi.history.post).toHaveLength(1);
  },
};

export const Liked: Story = {
  name: "좋아요 함 (로그인)",
  beforeEach: () => {
    useAuthStore.setState({ isAuthenticated: true, accessToken: "mock-token" });
    mockApi.onGet(BLOG.LIKE(mockFeedDetail.id)).reply(...ok({ isLike: true }));
    mockApi.onPost(BLOG.LIKE(mockFeedDetail.id)).reply(...ok(null));
    mockApi.onDelete(BLOG.LIKE(mockFeedDetail.id)).reply(...ok(null));
  },
};

export const NotAuthenticated: Story = {
  name: "비로그인",
  beforeEach: () => {
    useAuthStore.setState({ isAuthenticated: false, accessToken: null });
  },
};
