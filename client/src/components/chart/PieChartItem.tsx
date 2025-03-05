import { LabelList, Pie, PieChart, Cell } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

import { ChartPlatform } from "@/types/chart";

type BarType = {
  data: ChartPlatform[];
  title: string;
};

const chartConfig: ChartConfig = {
  count: {
    label: "Count",
  },
  tistory: {
    label: "Tistory",
    color: "hsl(210, 60%, 70%)",
  },
  velog: {
    label: "Velog",
    color: "hsl(150, 60%, 70%)",
  },
  medium: {
    label: "Medium",
    color: "hsl(30, 60%, 70%)",
  },
} satisfies ChartConfig;

export default function PieChartItem({ data, title }: BarType) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] [&_.recharts-text]:fill-background"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie data={data} dataKey="count" nameKey="platform">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={chartConfig[entry.platform]?.color ?? "#ccc"} />
              ))}
              <LabelList dataKey="platform" className="fill-background" stroke="none" fontSize={12} />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
