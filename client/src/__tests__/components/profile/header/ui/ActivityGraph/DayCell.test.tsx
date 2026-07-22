import { describe, expect, it, vi } from "vitest";

import { DayCell } from "@/components/profile/header/ui/ActivityGraph/DayCell.tsx";

import { DayInfo } from "@/types/activity.ts";
import { render, screen } from "@testing-library/react";

vi.mock("@/components/ui/tooltip.tsx", () => {
  const pass = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  return { Tooltip: pass, TooltipContent: pass, TooltipTrigger: pass };
});

describe("DayCell", () => {
  it("empty인 날은 빈 칸만 렌더링해야 한다", () => {
    const { container } = render(<DayCell dayInfo={{ empty: true } as DayInfo} />);

    expect(container.textContent).toBe("");
  });

  it("데이터가 있는 날은 날짜와 조회수 정보를 렌더링해야 한다", () => {
    const dayInfo = { empty: false, count: 5, dateStr: "2024-03-26" } as DayInfo;
    render(<DayCell dayInfo={dayInfo} />);

    expect(screen.getByText("2024-03-26: 5 views")).toBeInTheDocument();
  });

  it("unit prop을 넘기면 툴팁 단위를 바꿔 렌더링해야 한다", () => {
    const dayInfo = { empty: false, count: 3, dateStr: "2025-01-15" } as DayInfo;
    render(<DayCell dayInfo={dayInfo} unit="포스트" />);

    expect(screen.getByText("2025-01-15: 3 포스트")).toBeInTheDocument();
  });
});
