import type { Meta, StoryObj } from "@storybook/react-vite";

import AdminCertificate from "@/pages/email-actions/AdminCertificate";

import { ADMIN } from "@/constants/endpoints";

import { fail, mockApi, ok } from "@/__storybook__/mockApi";

const meta = {
  title: "pages/email-actions/AdminCertificate",
  component: AdminCertificate,
  parameters: {
    router: { initialEntries: ["/admin/certificate?token=test-token"] },
  },
} satisfies Meta<typeof AdminCertificate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  beforeEach: () => {
    mockApi.onPost(ADMIN.CERTIFICATE).reply(...ok(null, "인증 성공"));
  },
};

export const Error: Story = {
  beforeEach: () => {
    mockApi.onPost(ADMIN.CERTIFICATE).reply(...fail(400, "인증 링크가 만료되었습니다."));
  },
};
