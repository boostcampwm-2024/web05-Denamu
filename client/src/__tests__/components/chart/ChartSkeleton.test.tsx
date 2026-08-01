import { describe, expect, it } from "vitest";

import ChartSkeleton from "@/components/chart/ChartSkeleton.tsx";

import { render, screen } from "@testing-library/react";

describe("ChartSkeleton", () => {
  it("두 개의 BarChart와 PieChart placeholder 제목이 렌더링되어야 한다", () => {
    render(<ChartSkeleton />);

    expect(screen.getByText("전체 조회수")).toBeInTheDocument();
    expect(screen.getByText("오늘의 조회수")).toBeInTheDocument();
    expect(screen.getByText("플랫폼별 블로그 수")).toBeInTheDocument();
  });
});
