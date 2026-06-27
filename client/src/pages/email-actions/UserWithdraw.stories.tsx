import type { Meta, StoryObj } from "@storybook/react-vite";

import UserWithdraw from "@/pages/email-actions/UserWithdraw";

import { fail, mockApi, ok } from "@/__storybook__/mockApi";

const ENDPOINT = /\/api\/users\/deletion-requests\/.+/;

const meta = {
  title: "pages/email-actions/UserWithdraw",
  component: UserWithdraw,
  parameters: {
    router: { initialEntries: ["/user/withdraw?token=test-token"] },
  },
} satisfies Meta<typeof UserWithdraw>;

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
