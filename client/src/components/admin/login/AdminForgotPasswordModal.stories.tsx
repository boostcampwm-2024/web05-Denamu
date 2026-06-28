import AdminForgotPasswordModal from "@/components/admin/login/AdminForgotPasswordModal";

import { ADMIN } from "@/constants/endpoints";

import { fail, mockApi, ok } from "@/__storybook__/mockApi";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

const meta = {
  title: "admin/login/AdminForgotPasswordModal",
  component: AdminForgotPasswordModal,
  args: { open: true, onOpenChange: fn() },
} satisfies Meta<typeof AdminForgotPasswordModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  beforeEach: () => {
    mockApi.onPost(ADMIN.PASSWORD_RESET_REQUEST).reply(...ok(null, "비밀번호 재설정 이메일 발송 완료"));
  },
};

export const Error: Story = {
  beforeEach: () => {
    mockApi.onPost(ADMIN.PASSWORD_RESET_REQUEST).reply(...fail(400, "요청 데이터 검증에 실패했습니다."));
  },
};
