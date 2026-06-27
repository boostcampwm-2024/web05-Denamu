import type { Meta, StoryObj } from "@storybook/react-vite";

import Profile from "@/pages/Profile";

const meta = {
  title: "pages/Profile",
  component: Profile,
} satisfies Meta<typeof Profile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
