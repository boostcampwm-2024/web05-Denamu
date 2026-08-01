import type { Meta, StoryObj } from "@storybook/react-vite";

import { AuthBanner } from "@/components/auth/AuthBanner";

const meta = {
  title: "auth/AuthBanner",
  component: AuthBanner,
} satisfies Meta<typeof AuthBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
