import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { AuthSocialLoginButtons } from "@/components/auth/AuthSocialLoginButtons";
import { mockRedirect } from "@/__storybook__/mockApi";
import { nav } from "@/utils/redirect";

const meta = {
  title: "auth/AuthSocialLoginButtons",
  component: AuthSocialLoginButtons,
} satisfies Meta<typeof AuthSocialLoginButtons>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  beforeEach: () => mockRedirect(),
};

export const GithubLogin: Story = {
  name: "Github 로그인 클릭",
  beforeEach: () => mockRedirect(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId("oauth-github-button"));
    await expect(nav.redirect).toHaveBeenCalledWith(expect.stringContaining("type=github"));
  },
};

export const GoogleLogin: Story = {
  name: "Google 로그인 클릭",
  beforeEach: () => mockRedirect(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId("oauth-google-button"));
    await expect(nav.redirect).toHaveBeenCalledWith(expect.stringContaining("type=google"));
  },
};
