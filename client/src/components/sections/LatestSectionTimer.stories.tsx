import type { Meta, StoryObj } from "@storybook/react-vite";

import LatestSectionTimer from "@/components/sections/LatestSectionTimer";

const meta = {
  title: "sections/LatestSectionTimer",
  component: LatestSectionTimer,
} satisfies Meta<typeof LatestSectionTimer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
