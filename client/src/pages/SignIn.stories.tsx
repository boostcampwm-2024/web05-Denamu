import type { Meta, StoryObj } from "@storybook/react-vite";

import SignIn from "@/pages/SignIn";

const meta = {
  title: "pages/SignIn",
  component: SignIn,
} satisfies Meta<typeof SignIn>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
