import type { Meta, StoryObj } from "@storybook/react-vite";

import OAuthSuccessPage from "@/pages/OAuthSuccessPage";

const meta = {
  title: "pages/OAuthSuccessPage",
  component: OAuthSuccessPage,
} satisfies Meta<typeof OAuthSuccessPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
