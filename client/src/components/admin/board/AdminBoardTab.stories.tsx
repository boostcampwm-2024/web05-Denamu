import AdminBoardTab from "@/components/admin/board/AdminBoardTab";

import { BOARD } from "@/constants/endpoints";

import { mockBoardsPage } from "@/__storybook__/fixtures";
import { fail, mockApi, ok } from "@/__storybook__/mockApi";
import { BoardStatus } from "@/types/board";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "admin/board/AdminBoardTab",
  component: AdminBoardTab,
} satisfies Meta<typeof AdminBoardTab>;

export default meta;
type Story = StoryObj<typeof meta>;

const setupFilterableBoards = () => {
  mockApi.onGet(BOARD.ADMIN_LIST).reply((config) => {
    const status = config.params?.status as BoardStatus | undefined;
    const filtered = status
      ? mockBoardsPage.result.filter((board) => board.status === status)
      : mockBoardsPage.result;
    return ok({ ...mockBoardsPage, result: filtered, totalCount: filtered.length });
  });
};

export const WithData: Story = {
  name: "공지사항 목록 있음",
  beforeEach: setupFilterableBoards,
};

export const Empty: Story = {
  name: "공지사항 없음",
  beforeEach: () => {
    mockApi.onGet(BOARD.ADMIN_LIST).reply(...ok({ result: [], page: 1, limit: 10, totalCount: 0, hasMore: false }));
  },
};

export const Loading: Story = {
  name: "로딩 중",
  beforeEach: () => {
    mockApi.onGet(BOARD.ADMIN_LIST).reply(() => new Promise(() => {}));
  },
};

export const Error: Story = {
  name: "오류",
  beforeEach: () => {
    mockApi.onGet(BOARD.ADMIN_LIST).reply(...fail());
  },
};

export const FilterByStatus: Story = {
  name: "상태 필터 전환",
  beforeEach: setupFilterableBoards,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText("서비스 정기 점검 안내", { exact: false })).toBeInTheDocument();
    await expect(canvas.getByText("여름 이벤트 안내", { exact: false })).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("tab", { name: "임시저장" }));

    await waitFor(() => expect(canvas.getByText("다음 업데이트 예고 (작성 중)", { exact: false })).toBeInTheDocument());
    await expect(canvas.queryByText("서비스 정기 점검 안내", { exact: false })).not.toBeInTheDocument();
  },
};
