import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import AdminMember from "@/components/admin/layout/AdminMember";
import { ADMIN } from "@/constants/endpoints";
import { mockChildAdmins } from "@/__storybook__/fixtures";
import { mockApi, ok, fail } from "@/__storybook__/mockApi";

const meta = {
  title: "admin/layout/AdminMember",
  component: AdminMember,
} satisfies Meta<typeof AdminMember>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithChildren: Story = {
  name: "하위 관리자 있음",
  beforeEach: () => {
    const origAlert = window.alert;
    window.alert = fn() as never;
    mockApi.onGet(ADMIN.CHILDREN).reply(...ok(mockChildAdmins));
    mockApi.onDelete(/\/api\/admins\/children\/\d+/).reply(...ok({ message: "삭제되었습니다." }));
    mockApi.onPost(ADMIN.REGISTER).reply(...ok({ message: "인증 이메일을 발송했습니다." }));
    return () => { window.alert = origAlert; };
  },
};

export const NoChildren: Story = {
  name: "하위 관리자 없음",
  beforeEach: () => {
    const origAlert = window.alert;
    window.alert = fn() as never;
    mockApi.onGet(ADMIN.CHILDREN).reply(...ok([]));
    mockApi.onPost(ADMIN.REGISTER).reply(...ok({ message: "인증 이메일을 발송했습니다." }));
    return () => { window.alert = origAlert; };
  },
};

export const Loading: Story = {
  name: "로딩 중",
  beforeEach: () => {
    mockApi.onGet(ADMIN.CHILDREN).reply(() => new Promise(() => {}));
  },
};

export const Error: Story = {
  name: "오류",
  beforeEach: () => {
    mockApi.onGet(ADMIN.CHILDREN).reply(...fail());
  },
};
