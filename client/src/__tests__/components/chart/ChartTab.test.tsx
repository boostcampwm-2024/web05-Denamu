import { describe, expect, it, vi } from "vitest";

import ChartTab from "@/components/chart/ChartTab.tsx";

import { render, screen } from "@testing-library/react";

vi.mock("@/components/chart/Chart", () => ({
  default: () => <div data-testid="chart" />,
}));

describe("ChartTab", () => {
  it("lazy 로딩된 Chart를 Suspense로 렌더링해야 한다", async () => {
    render(<ChartTab />);

    expect(await screen.findByTestId("chart")).toBeInTheDocument();
  });
});
