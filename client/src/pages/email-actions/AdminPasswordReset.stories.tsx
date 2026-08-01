import type { Meta, StoryObj } from "@storybook/react-vite";

import AdminPasswordReset from "@/pages/email-actions/AdminPasswordReset";

import { fail, mockApi, ok } from "@/__storybook__/mockApi";

const ENDPOINT = /\/api\/admins\/password-resets\/.+/;

const meta = {
  title: "pages/email-actions/AdminPasswordReset",
  component: AdminPasswordReset,
  parameters: {
    router: { initialEntries: ["/admins/password-resets/confirm?token=test-token"] },
  },
} satisfies Meta<typeof AdminPasswordReset>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  beforeEach: () => {
    mockApi.onPatch(ENDPOINT).reply(...ok(null, "비밀번호 변경 완료"));
  },
};

export const Error: Story = {
  beforeEach: () => {
    mockApi.onPatch(ENDPOINT).reply(...fail(404, "인증에 실패했습니다."));
  },
};
