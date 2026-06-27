import type { Meta, StoryObj } from "@storybook/react-vite";

import { Google } from "@/components/icons/social/Google";

const meta = {
  title: "icons/social/Google",
  component: Google,
} satisfies Meta<typeof Google>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
