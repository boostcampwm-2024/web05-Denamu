import type { Meta, StoryObj } from "@storybook/react-vite";

import RssCertificate from "@/pages/email-actions/RssCertificate";

import { BLOG } from "@/constants/endpoints";

import { fail, mockApi, ok } from "@/__storybook__/mockApi";

const meta = {
  title: "pages/email-actions/RssCertificate",
  component: RssCertificate,
  parameters: {
    router: { initialEntries: ["/rss/certificate?code=test-code"] },
  },
} satisfies Meta<typeof RssCertificate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  beforeEach: () => {
    mockApi.onPost(BLOG.RSS.CERTIFICATION_VERIFY).reply(...ok(null, "인증 성공"));
  },
};

export const Error: Story = {
  beforeEach: () => {
    // 400 (not 401) so the page shows its failure UI instead of redirecting to /signin.
    mockApi.onPost(BLOG.RSS.CERTIFICATION_VERIFY).reply(...fail(400, "인증 코드가 유효하지 않습니다."));
  },
};
