import AdminReportTab from "@/components/admin/report/AdminReportTab";

import { REPORT } from "@/constants/endpoints";

import { mockReportsPage } from "@/__storybook__/fixtures";
import { fail, mockApi, ok } from "@/__storybook__/mockApi";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "admin/report/AdminReportTab",
  component: AdminReportTab,
} satisfies Meta<typeof AdminReportTab>;

export default meta;
type Story = StoryObj<typeof meta>;

const setupReports = () => {
  mockApi.onGet(REPORT.ADMIN_LIST).reply(...ok(mockReportsPage));
};

const setupActionableReports = () => {
  setupReports();
  mockApi.onPost(/\/api\/admins\/reports\/\d+\/suspensions/).reply(...ok(null));
  mockApi.onDelete(/\/api\/admins\/reports\/\d+/).reply(...ok(null));
};

export const WithData: Story = {
  name: "신고 목록 있음",
  beforeEach: setupReports,
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

export const ApproveReport: Story = {
  name: "신고 승인 (정지 처리)",
  beforeEach: setupActionableReports,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    const [approveButton] = await canvas.findAllByRole("button", { name: "승인" });
    await userEvent.click(approveButton);
    await userEvent.type(
      await body.findByPlaceholderText("정지 사유 및 처리 내용을 입력해주세요."),
      "반복적인 스팸으로 정지 처리합니다."
    );
    await userEvent.click(body.getByRole("button", { name: "정지 처리" }));

    await waitFor(() => expect(mockApi.history.post).toHaveLength(1));
  },
};

export const RejectReport: Story = {
  name: "신고 거절",
  beforeEach: setupActionableReports,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    const [rejectButton] = await canvas.findAllByRole("button", { name: "거절" });
    await userEvent.click(rejectButton);
    await userEvent.click(await body.findByRole("button", { name: "거절하기" }));

    await waitFor(() => expect(mockApi.history.delete).toHaveLength(1));
  },
};
