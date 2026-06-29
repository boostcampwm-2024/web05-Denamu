import type { Meta, StoryObj } from "@storybook/react-vite";

import { LikedList } from "@/components/profile/LikedList";
import { PROFILE } from "@/constants/endpoints";
import { mockLikedItemsPage } from "@/__storybook__/fixtures";
import { mockApi, ok, fail } from "@/__storybook__/mockApi";

const meta = {
  title: "profile/LikedList",
  component: LikedList,
  args: { userId: 1 },
} satisfies Meta<typeof LikedList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithLikes: Story = {
  name: "좋아요 있음",
  beforeEach: () => {
    mockApi.onGet(PROFILE.LIKES(1)).reply(...ok(mockLikedItemsPage));
  },
};

export const WithMorePages: Story = {
  name: "더 보기 있음",
  beforeEach: () => {
    mockApi.onGet(PROFILE.LIKES(1)).reply(...ok({ ...mockLikedItemsPage, hasMore: true, lastId: 10 }));
  },
};

export const Loading: Story = {
  name: "로딩 중",
  beforeEach: () => {
    mockApi.onGet(PROFILE.LIKES(1)).reply(() => new Promise(() => {}));
  },
};

export const Empty: Story = {
  name: "좋아요 없음",
  beforeEach: () => {
    mockApi.onGet(PROFILE.LIKES(1)).reply(...ok({ result: [], lastId: 0, hasMore: false }));
  },
};

export const Error: Story = {
  name: "오류",
  beforeEach: () => {
    mockApi.onGet(PROFILE.LIKES(1)).reply(...fail());
  },
};
