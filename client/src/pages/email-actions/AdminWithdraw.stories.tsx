import type { Meta, StoryObj } from "@storybook/react-vite";

import AdminWithdraw from "@/pages/email-actions/AdminWithdraw";

import { fail, mockApi, ok } from "@/__storybook__/mockApi";

const ENDPOINT = /\/api\/admins\/deletion-requests\/.+/;

const meta = {
  title: "pages/email-actions/AdminWithdraw",
  component: AdminWithdraw,
  parameters: {
    router: { initialEntries: ["/admin/withdraw?token=test-token"] },
  },
} satisfies Meta<typeof AdminWithdraw>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  beforeEach: () => {
    mockApi.onDelete(ENDPOINT).reply(...ok(null, "탈퇴 완료"));
  },
};

export const Error: Story = {
  beforeEach: () => {
    mockApi.onDelete(ENDPOINT).reply(...fail(400, "탈퇴 링크가 만료되었습니다."));
  },
};
