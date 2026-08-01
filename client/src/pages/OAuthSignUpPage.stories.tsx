import type { Meta, StoryObj } from "@storybook/react-vite";

import OAuthSignUpPage from "@/pages/OAuthSignUpPage";

const meta = {
  title: "pages/OAuthSignUpPage",
  component: OAuthSignUpPage,
} satisfies Meta<typeof OAuthSignUpPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
