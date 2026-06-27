import { describe, expect, it, vi } from "vitest";

import { Week } from "@/components/profile/header/ui/ActivityGraph/Week.tsx";

import { WeekInfo } from "@/types/activity.ts";
import { render, screen } from "@testing-library/react";

vi.mock("@/components/profile/header/ui/ActivityGraph/DayCell.tsx", () => ({
  DayCell: ({ dayInfo }: { dayInfo: { dateStr: string } }) => <div data-testid="day-cell">{dayInfo.dateStr}</div>,
}));

describe("Week", () => {
  it("주의 날짜 수만큼 DayCell을 렌더링해야 한다", () => {
    const weekInfo = {
      weekNumber: 1,
      days: Array.from({ length: 7 }, (_, i) => ({ dateStr: `day-${i}`, empty: false, count: 0 })),
    } as unknown as WeekInfo;

    render(<Week weekInfo={weekInfo} />);

    expect(screen.getAllByTestId("day-cell")).toHaveLength(7);
  });
});
