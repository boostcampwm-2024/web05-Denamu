import { describe, expect, it } from "vitest";

import { MonthLabels } from "@/components/profile/header/ui/ActivityGraph/MonthLabels.tsx";

import { WeekInfo } from "@/types/activity.ts";
import { render, screen } from "@testing-library/react";

describe("MonthLabels", () => {
  it("월 1일이 포함된 주에 월 라벨을 렌더링해야 한다", () => {
    const weeks = [
      { weekNumber: 0, days: [{ empty: false, date: new Date(2024, 2, 1), count: 0, dateStr: "2024-03-01" }] },
    ] as unknown as WeekInfo[];

    render(<MonthLabels weeks={weeks} />);

    expect(screen.getByText("Mar")).toBeInTheDocument();
  });

  it("월 1일이 없으면 라벨을 렌더링하지 않아야 한다", () => {
    const weeks = [
      { weekNumber: 0, days: [{ empty: false, date: new Date(2024, 2, 15), count: 0, dateStr: "2024-03-15" }] },
    ] as unknown as WeekInfo[];

    const { container } = render(<MonthLabels weeks={weeks} />);

    expect(container.querySelector(".absolute")).not.toBeInTheDocument();
  });
});
