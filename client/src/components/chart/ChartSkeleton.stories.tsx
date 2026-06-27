import type { Meta, StoryObj } from "@storybook/react-vite";

import ChartSkeleton from "@/components/chart/ChartSkeleton";

const meta = {
  title: "chart/ChartSkeleton",
  component: ChartSkeleton,
} satisfies Meta<typeof ChartSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
