import { describe, expect, it } from "vitest";

import { StreakStats } from "@/components/profile/StreakStats.tsx";

import { render, screen } from "@testing-library/react";

describe("StreakStats", () => {
  it("최장/현재 스트릭과 총 읽은 수를 천 단위로 렌더링해야 한다", () => {
    render(<StreakStats maxStreak={120} currentStreak={7} totalViews={12345} />);

    expect(screen.getByText("120일")).toBeInTheDocument();
    expect(screen.getByText("7일")).toBeInTheDocument();
    expect(screen.getByText("12,345")).toBeInTheDocument();
    expect(screen.getByText("최장 스트릭")).toBeInTheDocument();
    expect(screen.getByText("현재 스트릭")).toBeInTheDocument();
    expect(screen.getByText("총 읽은 수")).toBeInTheDocument();
  });
});
