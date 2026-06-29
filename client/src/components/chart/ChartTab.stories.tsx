import type { Meta, StoryObj } from "@storybook/react-vite";

import ChartTab from "@/components/chart/ChartTab";
import { CHART } from "@/constants/endpoints";
import { mockChartAllData, mockChartTodayData, mockChartPlatforms } from "@/__storybook__/fixtures";
import { mockApi, ok, fail } from "@/__storybook__/mockApi";

const meta = {
  title: "chart/ChartTab",
  component: ChartTab,
} satisfies Meta<typeof ChartTab>;

export default meta;
type Story = StoryObj<typeof meta>;

// CHART.TODAY/ALL have embedded query strings ("/api/statistics/today?limit=5").
// Regex match is safer than exact string since axios may normalize the URL.
const setupChartMocks = (allData: unknown, todayData: unknown, platformData: unknown) => {
  mockApi.onGet(/\/api\/statistics\/all/).reply(...ok(allData));
  mockApi.onGet(/\/api\/statistics\/today/).reply(...ok(todayData));
  mockApi.onGet(CHART.PLATFORM).reply(...ok(platformData));
};

export const WithData: Story = {
  name: "데이터 있음",
  beforeEach: () => setupChartMocks(mockChartAllData, mockChartTodayData, mockChartPlatforms),
};

export const Loading: Story = {
  name: "로딩 중",
  beforeEach: () => {
    mockApi.onGet(/\/api\/statistics\/all/).reply(() => new Promise(() => {}));
    mockApi.onGet(/\/api\/statistics\/today/).reply(() => new Promise(() => {}));
    mockApi.onGet(CHART.PLATFORM).reply(() => new Promise(() => {}));
  },
};

export const Empty: Story = {
  name: "데이터 없음",
  beforeEach: () => setupChartMocks([], [], []),
};

export const Error: Story = {
  name: "오류",
  beforeEach: () => {
    mockApi.onGet(/\/api\/statistics\/all/).reply(...fail());
    mockApi.onGet(/\/api\/statistics\/today/).reply(...fail());
    mockApi.onGet(CHART.PLATFORM).reply(...fail());
  },
};
