import type { Meta, StoryObj } from "@storybook/react-vite";

import Admin from "@/pages/Admin";

import { ADMIN } from "@/constants/endpoints";

import { fail, mockApi, ok } from "@/__storybook__/mockApi";
import { mockAdminRssList } from "@/__storybook__/fixtures";

const meta = {
  title: "pages/Admin",
  component: Admin,
} satisfies Meta<typeof Admin>;

export default meta;
type Story = StoryObj<typeof meta>;

// 인증 성공 → 대시보드. RSS 목록 조회도 함께 mock.
export const Success: Story = {
  beforeEach: () => {
    mockApi.onGet(ADMIN.ME).reply(...ok({ name: "관리자" }, "조회 완료"));
    mockApi.onGet(ADMIN.GET.RSS).reply(...ok(mockAdminRssList));
    mockApi.onGet(ADMIN.GET.ACCEPT).reply(...ok([]));
    mockApi.onGet(ADMIN.GET.REJECT).reply(...ok([]));
  },
};

// 인증 실패 → 로그인 모달.
export const Error: Story = {
  beforeEach: () => {
    mockApi.onGet(ADMIN.ME).reply(...fail(500, "인증되지 않은 요청입니다."));
  },
};
