import type { Meta, StoryObj } from "@storybook/react-vite";

import SignUp from "@/pages/SignUp";

const meta = {
  title: "pages/SignUp",
  component: SignUp,
} satisfies Meta<typeof SignUp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
