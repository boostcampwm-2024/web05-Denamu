import type { Meta, StoryObj } from "@storybook/react-vite";

import BarChartItem from "@/components/chart/BarChartItem";
import { ChartType } from "@/types/chart";

const meta = {
  title: "chart/BarChartItem",
  component: BarChartItem,
  args: {
    data: [{ id: 1, title: "게시글 제목", viewCount: 100 }] as ChartType[],
    title: "차트 제목",
    description: "차트 설명",
    color: false,
  },
} satisfies Meta<typeof BarChartItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
