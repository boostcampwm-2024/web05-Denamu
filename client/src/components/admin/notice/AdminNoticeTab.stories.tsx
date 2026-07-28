import AdminNoticeTab from "@/components/admin/notice/AdminNoticeTab";

import { NOTICE } from "@/constants/endpoints";

import { mockNoticesPage } from "@/__storybook__/fixtures";
import { fail, mockApi, ok } from "@/__storybook__/mockApi";
import { NoticeStatus } from "@/types/notice";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "admin/notice/AdminNoticeTab",
  component: AdminNoticeTab,
} satisfies Meta<typeof AdminNoticeTab>;

export default meta;
type Story = StoryObj<typeof meta>;

const setupFilterableNotices = () => {
  mockApi.onGet(NOTICE.ADMIN_LIST).reply((config) => {
    const status = config.params?.status as NoticeStatus | undefined;
    const filtered = status
      ? mockNoticesPage.result.filter((notice) => notice.status === status)
      : mockNoticesPage.result;
    return ok({ ...mockNoticesPage, result: filtered, totalCount: filtered.length });
  });
};

export const WithData: Story = {
  name: "공지사항 목록 있음",
  beforeEach: setupFilterableNotices,
};

export const Empty: Story = {
  name: "공지사항 없음",
  beforeEach: () => {
    mockApi.onGet(NOTICE.ADMIN_LIST).reply(...ok({ result: [], page: 1, limit: 10, totalCount: 0, hasMore: false }));
  },
};

export const Loading: Story = {
  name: "로딩 중",
  beforeEach: () => {
    mockApi.onGet(NOTICE.ADMIN_LIST).reply(() => new Promise(() => {}));
  },
};

export const Error: Story = {
  name: "오류",
  beforeEach: () => {
    mockApi.onGet(NOTICE.ADMIN_LIST).reply(...fail());
  },
};

export const FilterByStatus: Story = {
  name: "상태 필터 전환",
  beforeEach: setupFilterableNotices,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText("서비스 정기 점검 안내", { exact: false })).toBeInTheDocument();
    await expect(canvas.getByText("여름 이벤트 안내", { exact: false })).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("tab", { name: "임시저장" }));

    await waitFor(() => expect(canvas.getByText("다음 업데이트 예고 (작성 중)", { exact: false })).toBeInTheDocument());
    await expect(canvas.queryByText("서비스 정기 점검 안내", { exact: false })).not.toBeInTheDocument();
  },
};
