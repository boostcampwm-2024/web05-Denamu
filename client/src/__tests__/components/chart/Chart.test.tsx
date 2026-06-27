import { beforeEach, describe, expect, it, vi } from "vitest";

import Chart from "@/components/chart/Chart.tsx";

import { render, screen } from "@testing-library/react";

const useChartMock = vi.fn();
const isMobileMock = vi.fn(() => false);

vi.mock("@/hooks/queries/useChart", () => ({
  useChart: () => useChartMock(),
}));

vi.mock("@/store/useMediaStore", () => ({
  useMediaStore: (selector: (s: { isMobile: boolean }) => unknown) => selector({ isMobile: isMobileMock() }),
}));

vi.mock("@/components/chart/BarChartItem", () => ({
  default: ({ title }: { title: string }) => <div data-testid="bar-chart">{title}</div>,
}));

vi.mock("@/components/chart/PieChartItem", () => ({
  default: ({ title }: { title: string }) => <div data-testid="pie-chart">{title}</div>,
}));

vi.mock("@/components/chart/ChartSkeleton", () => ({
  default: () => <div data-testid="chart-skeleton" />,
}));

const chartData = {
  chartAll: { data: [] },
  chartToday: { data: [] },
  chartPlatform: { data: [] },
};

describe("Chart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isMobileMock.mockReturnValue(false);
  });

  it("로딩 중이면 ChartSkeleton을 렌더링해야 한다", () => {
    useChartMock.mockReturnValue({ data: undefined, isLoading: true, error: null });
    render(<Chart />);

    expect(screen.getByTestId("chart-skeleton")).toBeInTheDocument();
  });

  it("error가 있으면 에러 메시지를 렌더링해야 한다", () => {
    useChartMock.mockReturnValue({ data: chartData, isLoading: false, error: new Error("fail") });
    render(<Chart />);

    expect(screen.getByText("Error loading data")).toBeInTheDocument();
  });

  it("데스크톱에서 데이터가 있으면 BarChart 2개와 PieChart 1개를 렌더링해야 한다", async () => {
    useChartMock.mockReturnValue({ data: chartData, isLoading: false, error: null });
    render(<Chart />);

    expect(await screen.findAllByTestId("bar-chart")).toHaveLength(2);
    expect(screen.getAllByTestId("pie-chart")).toHaveLength(1);
  });

  it("모바일에서도 BarChart 2개와 PieChart 1개를 렌더링해야 한다", async () => {
    isMobileMock.mockReturnValue(true);
    useChartMock.mockReturnValue({ data: chartData, isLoading: false, error: null });
    render(<Chart />);

    expect(await screen.findAllByTestId("bar-chart")).toHaveLength(2);
    expect(screen.getAllByTestId("pie-chart")).toHaveLength(1);
  });
});
