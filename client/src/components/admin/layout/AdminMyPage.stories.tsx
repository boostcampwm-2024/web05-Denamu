import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import AdminMyPage from "@/components/admin/layout/AdminMyPage";
import { ADMIN } from "@/constants/endpoints";
import { mockAdminProfileData } from "@/__storybook__/fixtures";
import { mockApi, ok, fail } from "@/__storybook__/mockApi";

const meta = {
  title: "admin/layout/AdminMyPage",
  component: AdminMyPage,
  args: { onBack: fn() },
} satisfies Meta<typeof AdminMyPage>;

export default meta;
type Story = StoryObj<typeof meta>;

let _origAlert: typeof window.alert;
const setupProfileMutations = () => {
  _origAlert = window.alert;
  window.alert = fn() as never;
  mockApi.onPatch(ADMIN.UPDATE_ME).reply(...ok({ message: "수정되었습니다." }));
  mockApi.onPost(ADMIN.WITHDRAW_REQUEST).reply(...ok({ message: "탈퇴 요청이 완료되었습니다." }));
  return () => { window.alert = _origAlert; };
};

export const WithProfile: Story = {
  name: "프로필 로드됨",
  beforeEach: () => {
    mockApi.onGet(ADMIN.ME).reply(...ok(mockAdminProfileData));
    return setupProfileMutations();
  },
};

export const RootAdmin: Story = {
  name: "루트 관리자",
  beforeEach: () => {
    mockApi.onGet(ADMIN.ME).reply(...ok({ ...mockAdminProfileData, parent: null }));
    return setupProfileMutations();
  },
};

export const ChildAdmin: Story = {
  name: "하위 관리자",
  beforeEach: () => {
    mockApi.onGet(ADMIN.ME).reply(...ok({
      ...mockAdminProfileData,
      parent: { email: "root@denamu.dev", name: "루트 관리자" },
    }));
    return setupProfileMutations();
  },
};

export const EditProfile: Story = {
  name: "프로필 수정",
  beforeEach: () => {
    mockApi.onGet(ADMIN.ME).reply(...ok(mockAdminProfileData));
    return setupProfileMutations();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "수정하기" }));
    await userEvent.click(canvas.getByRole("button", { name: "수정 완료" }));
    await expect(mockApi.history.patch).toHaveLength(1);
    await expect(window.alert).toHaveBeenCalled();
  },
};

export const ToggleNotification: Story = {
  name: "이메일 수신 전환",
  beforeEach: () => {
    mockApi.onGet(ADMIN.ME).reply(...ok(mockAdminProfileData));
    return setupProfileMutations();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("switch"));
    await expect(mockApi.history.patch).toHaveLength(1);
  },
};

export const Withdraw: Story = {
  name: "회원 탈퇴 요청",
  beforeEach: () => {
    mockApi.onGet(ADMIN.ME).reply(...ok(mockAdminProfileData));
    return setupProfileMutations();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await canvas.findByRole("button", { name: "회원 탈퇴" }));
    await userEvent.click(await body.findByRole("button", { name: "인증 메일 발송" }));
    await expect(mockApi.history.post).toHaveLength(1);
    await expect(window.alert).toHaveBeenCalled();
  },
};

export const Loading: Story = {
  name: "로딩 중",
  beforeEach: () => {
    mockApi.onGet(ADMIN.ME).reply(() => new Promise(() => {}));
  },
};

export const Error: Story = {
  name: "오류",
  beforeEach: () => {
    mockApi.onGet(ADMIN.ME).reply(...fail(401, "인증이 필요합니다."));
  },
};
