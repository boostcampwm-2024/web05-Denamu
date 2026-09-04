import { describe, expect, it, vi } from "vitest";

import { ActivityGraph } from "@/components/profile/header/ui/ActivityGraph/ActivityGraph.tsx";

import { fireEvent, render, screen } from "@testing-library/react";

vi.mock("@/utils/activity.ts", () => ({
  processYearActivityData: () => ({ weeks: [{ weekNumber: 0, days: [] }] }),
}));

vi.mock("@/components/ui/tooltip.tsx", () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/profile/header/ui/ActivityGraph/MonthLabels.tsx", () => ({ MonthLabels: () => <div /> }));
vi.mock("@/components/profile/header/ui/ActivityGraph/DayLabels.tsx", () => ({ DayLabels: () => <div /> }));
vi.mock("@/components/profile/header/ui/ActivityGraph/Week.tsx", () => ({
  Week: ({ selectedDate }: { selectedDate?: string | null }) => <div data-testid="week">{selectedDate}</div>,
}));
vi.mock("@/components/profile/header/ui/ActivityGraph/Legend.tsx", () => ({
  Legend: ({ scale }: { scale?: string }) => <div data-testid="legend">{scale}</div>,
}));

describe("ActivityGraph", () => {
  it("Activity 제목과 연도 버튼들을 렌더링해야 한다", () => {
    render(<ActivityGraph dailyActivities={[]} year={2024} years={[2023, 2024]} onYearChange={vi.fn()} />);

    expect(screen.getByText("Activity")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "2023" })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "2024" })).toHaveLength(2);
  });

  it("연도 버튼 클릭 시 onYearChange를 호출해야 한다", () => {
    const onYearChange = vi.fn();
    render(<ActivityGraph dailyActivities={[]} year={2024} years={[2023, 2024]} onYearChange={onYearChange} />);

    fireEvent.click(screen.getAllByRole("button", { name: "2023" })[0]);

    expect(onYearChange).toHaveBeenCalledWith(2023);
  });

  it("selectedDate는 Week로, scale은 Legend로 전달해야 한다", () => {
    render(
      <ActivityGraph
        dailyActivities={[]}
        year={2024}
        years={[2024]}
        onYearChange={vi.fn()}
        scale="posts"
        selectedDate="2024-03-26"
      />
    );

    expect(screen.getByTestId("week")).toHaveTextContent("2024-03-26");
    expect(screen.getByTestId("legend")).toHaveTextContent("posts");
  });
});
