import type { Meta, StoryObj } from "@storybook/react-vite";

import { Settings } from "@/components/profile/sections/Settings";

const meta = {
  title: "profile/sections/Settings",
  component: Settings,
} satisfies Meta<typeof Settings>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
