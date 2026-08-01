import type { Meta, StoryObj } from "@storybook/react-vite";

import PieChartItem from "@/components/chart/PieChartItem";
import { mockChartPlatforms } from "@/__storybook__/fixtures";

const meta = {
  title: "chart/PieChartItem",
  component: PieChartItem,
  args: { data: mockChartPlatforms, title: "플랫폼별 게시글" },
} satisfies Meta<typeof PieChartItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
