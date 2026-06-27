import type { Meta, StoryObj } from "@storybook/react-vite";

import UserCertificate from "@/pages/email-actions/UserCertificate";

import { USER } from "@/constants/endpoints";

import { fail, mockApi, ok } from "@/__storybook__/mockApi";

const meta = {
  title: "pages/email-actions/UserCertificate",
  component: UserCertificate,
  parameters: {
    router: { initialEntries: ["/user/certificate?token=test-token"] },
  },
} satisfies Meta<typeof UserCertificate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  beforeEach: () => {
    mockApi.onPost(USER.CERTIFICATE).reply(...ok(null, "인증 성공"));
  },
};

export const Error: Story = {
  beforeEach: () => {
    mockApi.onPost(USER.CERTIFICATE).reply(...fail(400, "인증 링크가 만료되었습니다."));
  },
};
