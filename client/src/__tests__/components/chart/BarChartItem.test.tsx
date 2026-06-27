import { describe, expect, it } from "vitest";

import BarChartItem from "@/components/chart/BarChartItem.tsx";

import { ChartType } from "@/types/chart.ts";
import { render, screen } from "@testing-library/react";

const data: ChartType[] = [
  { id: 1, title: "포스트 A", viewCount: 100 },
  { id: 2, title: "포스트 B", viewCount: 50 },
];

describe("BarChartItem", () => {
  it("title과 description이 렌더링되어야 한다", () => {
    render(<BarChartItem data={data} title="전체 조회수" description="전체 조회수 TOP5" color={true} />);

    expect(screen.getByText("전체 조회수")).toBeInTheDocument();
    expect(screen.getByText("전체 조회수 TOP5")).toBeInTheDocument();
  });

  it("빈 data여도 에러 없이 렌더링되어야 한다", () => {
    render(<BarChartItem data={[]} title="오늘의 조회수" description="금일 조회수 TOP5" color={false} />);

    expect(screen.getByText("오늘의 조회수")).toBeInTheDocument();
  });
});
