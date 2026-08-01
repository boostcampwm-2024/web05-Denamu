import type { ReactNode } from "react";

import { describe, expect, it, vi } from "vitest";

import { Legend } from "@/components/profile/header/ui/ActivityGraph/Legend.tsx";

import { render, screen } from "@testing-library/react";

vi.mock("@/components/ui/tooltip.tsx", () => {
  const pass = ({ children }: { children: ReactNode }) => <div>{children}</div>;
  return { Tooltip: pass, TooltipContent: pass, TooltipProvider: pass, TooltipTrigger: pass };
});

describe("ActivityGraph Legend", () => {
  it("Less/More 라벨과 5단계 색상 칸을 렌더링해야 한다", () => {
    const { container } = render(<Legend />);

    expect(screen.getByText("Less")).toBeInTheDocument();
    expect(screen.getByText("More")).toBeInTheDocument();
    expect(container.querySelectorAll("div.rounded-sm")).toHaveLength(5);
  });

  it("기본(views) 스케일은 조회수 기준 툴팁을 렌더링해야 한다", () => {
    render(<Legend />);

    expect(screen.getByText("0 views")).toBeInTheDocument();
    expect(screen.getByText("1-4 views")).toBeInTheDocument();
    expect(screen.getByText("20+ views")).toBeInTheDocument();
  });

  it("posts 스케일은 포스트 수 기준 툴팁을 렌더링해야 한다", () => {
    render(<Legend scale="posts" />);

    expect(screen.getByText("0 posts")).toBeInTheDocument();
    expect(screen.getByText("1 posts")).toBeInTheDocument();
    expect(screen.getByText("3-4 posts")).toBeInTheDocument();
    expect(screen.getByText("5+ posts")).toBeInTheDocument();
  });
});
