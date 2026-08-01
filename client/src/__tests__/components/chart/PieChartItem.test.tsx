import { describe, expect, it } from "vitest";

import PieChartItem from "@/components/chart/PieChartItem.tsx";

import { ChartPlatform } from "@/types/chart.ts";
import { render, screen } from "@testing-library/react";

const data: ChartPlatform[] = [
  { platform: "tistory", count: 10 },
  { platform: "velog", count: 5 },
  { platform: "unknown", count: 1 },
];

describe("PieChartItem", () => {
  it("title이 렌더링되어야 한다", () => {
    render(<PieChartItem data={data} title="플랫폼별 블로그 수" />);

    expect(screen.getByText("플랫폼별 블로그 수")).toBeInTheDocument();
  });

  it("빈 data여도 에러 없이 렌더링되어야 한다", () => {
    render(<PieChartItem data={[]} title="플랫폼별 블로그 수" />);

    expect(screen.getByText("플랫폼별 블로그 수")).toBeInTheDocument();
  });
});
