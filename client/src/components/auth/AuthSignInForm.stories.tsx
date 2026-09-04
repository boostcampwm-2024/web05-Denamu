import { AuthSignInForm } from "@/components/auth/AuthSignInForm";

import { USER } from "@/constants/endpoints";

import { nav } from "@/utils/redirect";

import { mockApi, mockRedirect, ok, fail } from "@/__storybook__/mockApi";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

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

export const SuspendedLogin: Story = {
  name: "정지된 계정 로그인",
  beforeEach: () => {
    const cleanup = mockRedirect();
    mockApi.onPost(USER.LOGIN).reply(403, {
      message: "정지된 계정입니다.",
      data: { detail: "부적절한 게시글 반복 등록", suspendedUntil: null },
    });
    return cleanup;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillCredentials(canvas);
    await userEvent.click(canvas.getByRole("button", { name: "로그인" }));

    const body = within(canvasElement.ownerDocument.body);
    await expect(await body.findByText("정지된 계정입니다")).toBeInTheDocument();
    await expect(body.getByText(/부적절한 게시글 반복 등록/)).toBeInTheDocument();
    await expect(body.getByText(/무기한/)).toBeInTheDocument();
    await expect(body.getByText(/boostcamp9web05@gmail.com/)).toBeInTheDocument();
  },
};

export const RejoinRestricted: Story = {
  name: "재가입 제한 안내",
  parameters: {
    router: {
      initialEntries: ["/signin?error=rejoin_restricted&availableAt=2026-11-01T00:00:00.000Z"],
    },
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await expect(await body.findByText("재가입 제한")).toBeInTheDocument();
    await expect(await body.findByText(/이후 다시 시도해주세요/)).toBeInTheDocument();
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
