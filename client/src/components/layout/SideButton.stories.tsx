import type { Meta, StoryObj } from "@storybook/react-vite";

import SideButton from "@/components/layout/SideButton";

const meta = {
  title: "layout/SideButton",
  component: SideButton,
} satisfies Meta<typeof SideButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
