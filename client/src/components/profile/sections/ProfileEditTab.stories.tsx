import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { ProfileEditTab } from "@/components/profile/sections/ProfileEditTab";
import { FILE, OAUTH, PROFILE, USER } from "@/constants/endpoints";
import { mockUserProfile } from "@/__storybook__/fixtures";
import { mockApi, mockRedirect, ok } from "@/__storybook__/mockApi";
import { nav } from "@/utils/redirect";

const mockLinkedProviders = {
  hasPassword: true,
  providers: [
    { provider: "github", providerUserName: "min-d", linkedAt: "2026-01-01T00:00:00.000Z" },
  ],
};

const setupMutations = () => {
  mockApi.onPatch(PROFILE.UPDATE).reply(...ok({ message: "프로필이 수정되었습니다." }));
  mockApi.onPatch(USER.PASSWORD).reply(...ok({ message: "비밀번호가 변경되었습니다." }));
  mockApi.onPost(USER.DELETE_REQUEST).reply(...ok({ message: "탈퇴 신청이 완료되었습니다." }));
  mockApi.onPost(FILE.UPLOAD).reply(...ok({ url: "https://picsum.photos/seed/upload/120/120" }));
  mockApi.onGet(USER.USERNAME_AVAILABILITY).reply(...ok({ exists: false }));
  mockApi.onPost(OAUTH.LINKS).reply(...ok({ authUrl: "https://accounts.google.com/mock" }));
  mockApi.onDelete(/\/api\/oauth\/links\/[^/]+/).reply(...ok({ message: "연결이 해제되었습니다." }));
};

const meta = {
  title: "profile/sections/ProfileEditTab",
  component: ProfileEditTab,
  args: { userId: 1, email: "test@test.com" },
} satisfies Meta<typeof ProfileEditTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "프로필 수정 탭",
  beforeEach: () => {
    const cleanup = mockRedirect();
    mockApi.onGet(PROFILE.PROFILE(1)).reply(...ok(mockUserProfile));
    mockApi.onGet(OAUTH.LINKS).reply(...ok(mockLinkedProviders));
    setupMutations();
    return cleanup;
  },
};

export const SaveProfile: Story = {
  name: "프로필 저장",
  beforeEach: () => {
    const cleanup = mockRedirect();
    mockApi.onGet(PROFILE.PROFILE(1)).reply(...ok(mockUserProfile));
    mockApi.onGet(OAUTH.LINKS).reply(...ok(mockLinkedProviders));
    setupMutations();
    return cleanup;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(await canvas.findByLabelText("자기소개"), " 추가 소개");
    await userEvent.click(canvas.getByRole("button", { name: "저장" }));
    await expect(mockApi.history.patch).toHaveLength(1);
  },
};

export const NoOAuthLinked: Story = {
  name: "OAuth 미연결",
  beforeEach: () => {
    const cleanup = mockRedirect();
    mockApi.onGet(PROFILE.PROFILE(1)).reply(...ok(mockUserProfile));
    mockApi.onGet(OAUTH.LINKS).reply(...ok({ hasPassword: true, providers: [] }));
    setupMutations();
    return cleanup;
  },
};

export const ConnectOAuth: Story = {
  name: "OAuth 연결 클릭",
  beforeEach: () => {
    const cleanup = mockRedirect();
    mockApi.onGet(PROFILE.PROFILE(1)).reply(...ok(mockUserProfile));
    mockApi.onGet(OAUTH.LINKS).reply(...ok({ hasPassword: true, providers: [] }));
    setupMutations();
    return cleanup;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const connectButtons = await canvas.findAllByRole("button", { name: "연결" });
    await userEvent.click(connectButtons[0]);
    await expect(nav.redirect).toHaveBeenCalledWith("https://accounts.google.com/mock");
  },
};

export const Loading: Story = {
  name: "로딩 중",
  beforeEach: () => {
    mockApi.onGet(PROFILE.PROFILE(1)).reply(() => new Promise(() => {}));
    mockApi.onGet(OAUTH.LINKS).reply(() => new Promise(() => {}));
  },
};

export const UsernameTaken: Story = {
  name: "닉네임 중복 (중복 확인 시)",
  beforeEach: () => {
    mockApi.onGet(PROFILE.PROFILE(1)).reply(...ok(mockUserProfile));
    mockApi.onGet(OAUTH.LINKS).reply(...ok(mockLinkedProviders));
    mockApi.onGet(USER.USERNAME_AVAILABILITY).reply(...ok({ exists: true }));
    mockApi.onPatch(PROFILE.UPDATE).reply(...ok({ message: "프로필이 수정되었습니다." }));
    mockApi.onPatch(USER.PASSWORD).reply(...ok({ message: "비밀번호가 변경되었습니다." }));
    mockApi.onPost(USER.DELETE_REQUEST).reply(...ok({ message: "탈퇴 신청이 완료되었습니다." }));
    mockApi.onPost(FILE.UPLOAD).reply(...ok({ url: "https://picsum.photos/seed/upload/120/120" }));
    mockApi.onPost(OAUTH.LINKS).reply(...ok({ authUrl: "https://accounts.google.com/mock" }));
    mockApi.onDelete(/\/api\/oauth\/links\/[^/]+/).reply(...ok({ message: "연결이 해제되었습니다." }));
  },
};
