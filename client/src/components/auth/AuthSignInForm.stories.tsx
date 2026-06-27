import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { AuthSignInForm } from "@/components/auth/AuthSignInForm";
import { USER } from "@/constants/endpoints";
import { mockApi, mockRedirect, ok, fail } from "@/__storybook__/mockApi";
import { nav } from "@/utils/redirect";

const meta = {
  title: "auth/AuthSignInForm",
  component: AuthSignInForm,
} satisfies Meta<typeof AuthSignInForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const fillCredentials = async (canvas: ReturnType<typeof within>) => {
  await userEvent.type(canvas.getByPlaceholderText("이메일을 입력하세요"), "test@test.com");
  await userEvent.type(canvas.getByPlaceholderText("비밀번호를 입력하세요"), "password123");
};

export const Default: Story = {
  beforeEach: () => {
    const cleanup = mockRedirect();
    mockApi.onPost(USER.LOGIN).reply(...ok({ accessToken: null }));
    return cleanup;
  },
};

export const LoginSuccess: Story = {
  name: "로그인 제출",
  beforeEach: () => {
    const cleanup = mockRedirect();
    mockApi.onPost(USER.LOGIN).reply(...ok({ accessToken: null }));
    return cleanup;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillCredentials(canvas);
    await userEvent.click(canvas.getByRole("button", { name: "로그인" }));
    await expect(mockApi.history.post).toHaveLength(1);
  },
};

export const LoginError: Story = {
  name: "로그인 실패",
  beforeEach: () => {
    const cleanup = mockRedirect();
    mockApi.onPost(USER.LOGIN).reply(...fail(401, "아이디 혹은 비밀번호가 잘못되었습니다."));
    return cleanup;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillCredentials(canvas);
    await userEvent.click(canvas.getByRole("button", { name: "로그인" }));
    // 401 응답은 axiosInstance 인터셉터의 refresh 요청을 추가로 유발하므로 최소 1건(로그인)만 확인.
    await expect(mockApi.history.post.length).toBeGreaterThanOrEqual(1);
  },
};

export const SocialLogin: Story = {
  name: "소셜 로그인 클릭",
  beforeEach: () => mockRedirect(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId("oauth-github-button"));
    await expect(nav.redirect).toHaveBeenCalledWith(expect.stringContaining("type=github"));
  },
};
