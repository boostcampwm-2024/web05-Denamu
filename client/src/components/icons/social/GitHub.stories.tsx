import type { Meta, StoryObj } from "@storybook/react-vite";

import { GitHub } from "@/components/icons/social/GitHub";

const meta = {
  title: "icons/social/GitHub",
  component: GitHub,
} satisfies Meta<typeof GitHub>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
