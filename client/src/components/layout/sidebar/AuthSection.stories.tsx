import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor, within } from "storybook/test";

import { AuthSection } from "@/components/layout/sidebar/AuthSection";
import { axiosInstance } from "@/api/instance";
import { useAuthStore } from "@/store/useAuthStore";
import { USER } from "@/constants/endpoints";
import { mockApi, mockRedirect, fail } from "@/__storybook__/mockApi";
import { nav } from "@/utils/redirect";

const meta = {
  title: "layout/sidebar/AuthSection",
  component: AuthSection,
  args: { onAction: fn() },
} satisfies Meta<typeof AuthSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const PROTECTED_URL = "/api/storybook/session-check";

const loginAsUser = () => {
  useAuthStore.setState({
    accessToken: "storybook-access-token",
    role: "user",
    userInfo: { id: 1, email: "tester@denamu.dev", userName: "데나무 테스터" },
    isAuthenticated: true,
    isInitialized: true,
  });
};

export const SessionExpired: Story = {
  name: "refresh token 만료 → 자동 로그아웃 + 재로그인 유도",
  beforeEach: () => {
    loginAsUser();
    const restoreRedirect = mockRedirect();
    mockApi.onGet(PROTECTED_URL).reply(...fail(401, "인증이 만료되었습니다."));
    mockApi.onPost(USER.REFRESH_TOKEN).reply(...fail(401, "refresh token이 만료되었습니다."));

    return () => {
      restoreRedirect();
      useAuthStore.getState().forceLogout();
    };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 시작 시점: 로그인 상태 (닉네임 노출)
    await expect(canvas.getByText("데나무 테스터")).toBeInTheDocument();

    // 만료된 refresh token 상태에서 보호된 API를 호출 → axiosInstance 인터셉터가 세션을 정리
    await axiosInstance.get(PROTECTED_URL).catch(() => undefined);

    // 자동으로 로그아웃 상태로 전환되어 로그인 버튼이 노출됨
    await waitFor(() => expect(canvas.getByRole("button", { name: "로그인" })).toBeInTheDocument());
    await expect(nav.redirect).toHaveBeenCalledWith("/signin");
  },
};
