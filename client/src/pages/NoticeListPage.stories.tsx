import NoticeListPage from "@/pages/NoticeListPage";

import { NOTICE } from "@/constants/endpoints";

import { mockNoticesPage } from "@/__storybook__/fixtures";
import { fail, mockApi, ok } from "@/__storybook__/mockApi";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

const meta = {
  title: "pages/NoticeListPage",
  component: NoticeListPage,
  parameters: {
    router: { initialEntries: ["/notice"] },
  },
} satisfies Meta<typeof NoticeListPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithData: Story = {
  name: "공지사항 목록 있음",
  beforeEach: () => {
    mockApi.onGet(NOTICE.LIST).reply(...ok(mockNoticesPage));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("서비스 정기 점검 안내")).toBeInTheDocument();
    await expect(canvas.getByText("고정")).toBeInTheDocument();
  },
};

export const Empty: Story = {
  name: "공지사항 없음",
  beforeEach: () => {
    mockApi.onGet(NOTICE.LIST).reply(...ok({ result: [], page: 1, limit: 10, totalCount: 0, hasMore: false }));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("등록된 공지사항이 없습니다.")).toBeInTheDocument();
  },
};

export const Error: Story = {
  name: "오류",
  beforeEach: () => {
    mockApi.onGet(NOTICE.LIST).reply(...fail());
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("공지사항을 불러오지 못했습니다.")).toBeInTheDocument();
  },
};

export const Pagination: Story = {
  name: "페이지네이션",
  beforeEach: () => {
    mockApi.onGet(NOTICE.LIST).reply((config) => {
      const page = (config.params?.page as number | undefined) ?? 1;
      return ok({ ...mockNoticesPage, page, totalCount: 25 });
    });
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("1 / 3")).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: "다음" }));
    await expect(await canvas.findByText("2 / 3")).toBeInTheDocument();
  },
};
