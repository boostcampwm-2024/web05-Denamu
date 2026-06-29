import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { AuthSignUpForm } from "@/components/auth/AuthSignUpForm";
import { USER } from "@/constants/endpoints";
import { mockApi, ok, fail } from "@/__storybook__/mockApi";

const meta = {
  title: "auth/AuthSignUpForm",
  component: AuthSignUpForm,
} satisfies Meta<typeof AuthSignUpForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const fillForm = async (canvas: ReturnType<typeof within>) => {
  await userEvent.type(canvas.getByPlaceholderText("이메일을 입력하세요"), "test@test.com");
  await userEvent.type(canvas.getByPlaceholderText("비밀번호를 입력하세요"), "password123");
  await userEvent.type(canvas.getByPlaceholderText("이름을 입력해주세요"), "데나무");
};

export const Default: Story = {
  beforeEach: () => {
    mockApi.onPost(USER.REGISTER).reply(...ok(null));
  },
};

export const RegisterSuccess: Story = {
  name: "회원가입 제출",
  beforeEach: () => {
    mockApi.onPost(USER.REGISTER).reply(...ok(null));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas);
    await userEvent.click(canvas.getByRole("button", { name: "회원가입" }));
    await expect(mockApi.history.post).toHaveLength(1);
  },
};

export const RegisterError: Story = {
  name: "회원가입 실패",
  beforeEach: () => {
    mockApi.onPost(USER.REGISTER).reply(...fail(409, "이미 사용 중인 이메일입니다."));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas);
    await userEvent.click(canvas.getByRole("button", { name: "회원가입" }));
    await expect(mockApi.history.post).toHaveLength(1);
  },
};
