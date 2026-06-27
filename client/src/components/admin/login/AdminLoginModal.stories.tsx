import AdminLoginModal from "@/components/admin/login/AdminLoginModal";

import { ADMIN } from "@/constants/endpoints";

import { mockApi, ok } from "@/__storybook__/mockApi";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

const meta = {
  title: "admin/login/AdminLoginModal",
  component: AdminLoginModal,
  args: { setLogin: fn() },
} satisfies Meta<typeof AdminLoginModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  beforeEach: () => {
    mockApi.onPost(ADMIN.LOGIN).reply(...ok(null));
  },
};
