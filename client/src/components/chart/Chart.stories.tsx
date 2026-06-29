import type { Meta, StoryObj } from "@storybook/react-vite";

import Chart from "@/components/chart/Chart";
import { CHART } from "@/constants/endpoints";
import { mockChartPlatforms } from "@/__storybook__/fixtures";
import { mockApi } from "@/__storybook__/mockApi";

const mockBarData = [
  { id: 1, title: "TypeScript 완벽 가이드", viewCount: 3200 },
  { id: 2, title: "React 18 새로운 기능들", viewCount: 2800 },
  { id: 3, title: "NestJS로 API 만들기", viewCount: 2400 },
  { id: 4, title: "Docker Compose 실전", viewCount: 1900 },
  { id: 5, title: "Storybook 컴포넌트 문서화", viewCount: 1500 },
];

const meta = {
  title: "chart/Chart",
  component: Chart,
} satisfies Meta<typeof Chart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  name: "데이터 있음",
  beforeEach: () => {
    mockApi.onGet(CHART.ALL).reply(200, { message: "성공", data: mockBarData });
    mockApi.onGet(CHART.TODAY).reply(200, { message: "성공", data: mockBarData.slice(0, 3) });
    mockApi.onGet(CHART.PLATFORM).reply(200, { message: "성공", data: mockChartPlatforms });
  },
};

export const Loading: Story = {
  name: "로딩 중",
  beforeEach: () => {
    mockApi.onGet(CHART.ALL).reply(() => new Promise(() => {}));
    mockApi.onGet(CHART.TODAY).reply(() => new Promise(() => {}));
    mockApi.onGet(CHART.PLATFORM).reply(() => new Promise(() => {}));
  },
};

export const Error: Story = {
  name: "오류 발생",
  beforeEach: () => {
    mockApi.onGet(CHART.ALL).reply(500, { message: "서버 오류가 발생했습니다." });
    mockApi.onGet(CHART.TODAY).reply(500, { message: "서버 오류가 발생했습니다." });
    mockApi.onGet(CHART.PLATFORM).reply(500, { message: "서버 오류가 발생했습니다." });
  },
};
