import { describe, expect, it } from "vitest";

import { DayLabels } from "@/components/profile/header/ui/ActivityGraph/DayLabels.tsx";

import { render, screen } from "@testing-library/react";

describe("DayLabels", () => {
  it("Mon/Wed/Fri 라벨을 렌더링해야 한다", () => {
    render(<DayLabels />);

    expect(screen.getByText("Mon")).toBeInTheDocument();
    expect(screen.getByText("Wed")).toBeInTheDocument();
    expect(screen.getByText("Fri")).toBeInTheDocument();
  });
});
