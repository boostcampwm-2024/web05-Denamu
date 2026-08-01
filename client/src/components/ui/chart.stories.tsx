import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const config = {
  views: { label: "조회수", color: "hsl(220, 70%, 60%)" },
} satisfies ChartConfig;

const data = [
  { month: "1월", views: 120 },
  { month: "2월", views: 200 },
  { month: "3월", views: 150 },
  { month: "4월", views: 80 },
];

const meta = {
  title: "ui/ChartContainer",
  component: ChartContainer,
  args: { config },
} satisfies Meta<typeof ChartContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {
  render: () => (
    <ChartContainer config={config} className="h-[240px] w-[360px]">
      <BarChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="views" fill="var(--color-views)" radius={4} />
      </BarChart>
    </ChartContainer>
  ),
} as unknown as Story;
