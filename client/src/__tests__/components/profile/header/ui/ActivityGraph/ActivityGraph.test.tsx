import { describe, expect, it, vi } from "vitest";

import { ActivityGraph } from "@/components/profile/header/ui/ActivityGraph/ActivityGraph.tsx";

import { fireEvent, render, screen } from "@testing-library/react";

vi.mock("@/utils/activity.ts", () => ({ processYearActivityData: () => ({ weeks: [] }) }));

vi.mock("@/components/ui/tooltip.tsx", () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/profile/header/ui/ActivityGraph/MonthLabels.tsx", () => ({ MonthLabels: () => <div /> }));
vi.mock("@/components/profile/header/ui/ActivityGraph/DayLabels.tsx", () => ({ DayLabels: () => <div /> }));
vi.mock("@/components/profile/header/ui/ActivityGraph/Week.tsx", () => ({ Week: () => <div /> }));
vi.mock("@/components/profile/header/ui/ActivityGraph/Legend.tsx", () => ({ Legend: () => <div /> }));

describe("ActivityGraph", () => {
  it("Activity 제목과 연도 버튼들을 렌더링해야 한다", () => {
    render(<ActivityGraph dailyActivities={[]} year={2024} years={[2023, 2024]} onYearChange={vi.fn()} />);

    expect(screen.getByText("Activity")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2023" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2024" })).toBeInTheDocument();
  });

  it("연도 버튼 클릭 시 onYearChange를 호출해야 한다", () => {
    const onYearChange = vi.fn();
    render(<ActivityGraph dailyActivities={[]} year={2024} years={[2023, 2024]} onYearChange={onYearChange} />);

    fireEvent.click(screen.getByRole("button", { name: "2023" }));

    expect(onYearChange).toHaveBeenCalledWith(2023);
  });
});
