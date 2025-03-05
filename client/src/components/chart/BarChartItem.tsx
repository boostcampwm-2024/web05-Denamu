import { useState, useEffect, useRef } from "react";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

import { ChartType } from "@/types/chart";

type BarType = {
  data: ChartType[];
  title: string;
  description: string;
  color: boolean;
};

export default function BarChartItem({ data, title, description, color }: BarType) {
  const [componentWidth, setComponentWidth] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setComponentWidth(entry.contentRect.width);
      }
    });

    if (cardRef.current) {
      resizeObserver.observe(cardRef.current);
    }
    return () => {
      if (cardRef.current) {
        resizeObserver.unobserve(cardRef.current);
      }
    };
  }, []);
  const truncateText = (text: string) => {
    const charWidth = 55;
    const maxChars = Math.floor(componentWidth / charWidth);

    return text.length > maxChars ? `${text.slice(0, Math.max(0, maxChars - 3))}...` : text;
  };

  const chartConfig = {
    desktop: {
      label: "Desktop",
      color: color ? "hsl(200, 70%, 68%)" : "hsl(120, 70%, 68%)",
    },
  } satisfies ChartConfig;

  return (
    <Card ref={cardRef} className="w-full md:w-[50%]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="title"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => truncateText(value)}
            />
            <ChartTooltip cursor={true} content={<ChartTooltipContent />} />
            <Bar dataKey="viewCount" fill="var(--color-desktop)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
