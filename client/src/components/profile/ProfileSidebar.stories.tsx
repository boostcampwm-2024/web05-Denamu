import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { USER } from "@/constants/endpoints";
import { mockApi, ok } from "@/__storybook__/mockApi";

const meta = {
  title: "profile/ProfileSidebar",
  component: ProfileSidebar,
  args: { activeTab: "mypage" as const, onTabChange: fn(), isOwner: true },
} satisfies Meta<typeof ProfileSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  beforeEach: () => {
    mockApi.onPost(USER.LOGOUT).reply(...ok(null));
  },
};

export const Logout: Story = {
  name: "로그아웃 클릭",
  beforeEach: () => {
    mockApi.onPost(USER.LOGOUT).reply(...ok(null));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "로그아웃" }));
    await expect(mockApi.history.post).toHaveLength(1);
  },
};

export const NotOwner: Story = {
  name: "다른 사용자 프로필",
  args: { isOwner: false },
};
