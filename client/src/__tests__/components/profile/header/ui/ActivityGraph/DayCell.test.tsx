import type { ComponentProps, ReactNode } from "react";

import { describe, expect, it, vi } from "vitest";

import { DayCell } from "@/components/profile/header/ui/ActivityGraph/DayCell.tsx";

import { DayInfo } from "@/types/activity.ts";
import { fireEvent, render, screen } from "@testing-library/react";

vi.mock("@/components/ui/tooltip.tsx", () => {
  const pass = ({ children }: { children: ReactNode }) => <div>{children}</div>;
  const trigger = ({ children, ...props }: ComponentProps<"button">) => <button {...props}>{children}</button>;
  return { Tooltip: pass, TooltipContent: pass, TooltipTrigger: trigger };
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

  it("posts 스케일이면 툴팁 단위를 posts로 렌더링해야 한다", () => {
    const dayInfo = { empty: false, count: 3, dateStr: "2025-01-15" } as DayInfo;
    render(<DayCell dayInfo={dayInfo} scale="posts" />);

    expect(screen.getByText("2025-01-15: 3 posts")).toBeInTheDocument();
  });

  it("활동이 있는 칸을 클릭하면 onDayClick을 날짜와 함께 호출해야 한다", () => {
    const onDayClick = vi.fn();
    const dayInfo = { empty: false, count: 2, dateStr: "2025-01-15" } as DayInfo;
    render(<DayCell dayInfo={dayInfo} onDayClick={onDayClick} />);

    fireEvent.click(screen.getByRole("button"));

    expect(onDayClick).toHaveBeenCalledWith("2025-01-15");
  });

  it("활동이 없는 칸은 클릭해도 onDayClick을 호출하지 않아야 한다", () => {
    const onDayClick = vi.fn();
    const dayInfo = { empty: false, count: 0, dateStr: "2025-01-15" } as DayInfo;
    render(<DayCell dayInfo={dayInfo} onDayClick={onDayClick} />);

    fireEvent.click(screen.getByRole("button"));

    expect(onDayClick).not.toHaveBeenCalled();
  });

  it("selected인 칸은 선택 표시(ring)를 렌더링해야 한다", () => {
    const dayInfo = { empty: false, count: 2, dateStr: "2025-01-15" } as DayInfo;
    const { container } = render(<DayCell dayInfo={dayInfo} selected />);

    expect(container.querySelector(".ring-1")).not.toBeNull();
  });
});
