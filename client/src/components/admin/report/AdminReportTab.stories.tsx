import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import AdminReportTab from "@/components/admin/report/AdminReportTab";
import { REPORT } from "@/constants/endpoints";
import { mockReportsPage } from "@/__storybook__/fixtures";
import { fail, mockApi, ok } from "@/__storybook__/mockApi";
import { ReportStatus } from "@/types/report";

const meta = {
  title: "admin/report/AdminReportTab",
  component: AdminReportTab,
} satisfies Meta<typeof AdminReportTab>;

export default meta;
type Story = StoryObj<typeof meta>;

const setupFilterableReports = () => {
  mockApi.onGet(REPORT.ADMIN_LIST).reply((config) => {
    const status = config.params?.status as ReportStatus | undefined;
    const filtered = status ? mockReportsPage.result.filter((report) => report.status === status) : mockReportsPage.result;
    return ok({ result: filtered, lastId: filtered.at(-1)?.id ?? 0, hasMore: false });
  });
};

export const WithData: Story = {
  name: "신고 목록 있음",
  beforeEach: setupFilterableReports,
};

export const Empty: Story = {
  name: "신고 내역 없음",
  beforeEach: () => {
    mockApi.onGet(REPORT.ADMIN_LIST).reply(...ok({ result: [], lastId: 0, hasMore: false }));
  },
};

export const Loading: Story = {
  name: "로딩 중",
  beforeEach: () => {
    mockApi.onGet(REPORT.ADMIN_LIST).reply(() => new Promise(() => {}));
  },
};

export const Error: Story = {
  name: "오류",
  beforeEach: () => {
    mockApi.onGet(REPORT.ADMIN_LIST).reply(...fail());
  },
};

export const FilterByStatus: Story = {
  name: "상태 필터 전환",
  beforeEach: setupFilterableReports,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText("제보자1")).toBeInTheDocument();
    await expect(canvas.getByText("제보자2")).toBeInTheDocument();
    await expect(canvas.getByText("제보자3")).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("tab", { name: "미처리" }));

    await waitFor(() => expect(canvas.getByText("제보자1")).toBeInTheDocument());
    await expect(canvas.queryByText("제보자2")).not.toBeInTheDocument();
    await expect(canvas.queryByText("제보자3")).not.toBeInTheDocument();
  },
};
