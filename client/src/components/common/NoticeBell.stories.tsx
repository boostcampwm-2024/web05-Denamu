import { NoticeBell } from "@/components/common/NoticeBell";

import { BOARD } from "@/constants/endpoints";

import { mockApi, ok } from "@/__storybook__/mockApi";
import { BoardSummary } from "@/types/board";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

const meta = {
  title: "common/NoticeBell",
  component: NoticeBell,
} satisfies Meta<typeof NoticeBell>;

export default meta;
type Story = StoryObj<typeof meta>;

const pinnedNotice: BoardSummary = {
  id: 3,
  title: "서비스 정기 점검 안내",
  isPinned: true,
  status: "PUBLISHED",
  category: "NOTICE",
  startAt: null,
  endAt: null,
  createdAt: "2026-07-20T09:00:00.000Z",
};

const recentNotice: BoardSummary = {
  id: 2,
  title: "여름 이벤트 안내",
  isPinned: false,
  status: "PUBLISHED",
  category: "NOTICE",
  startAt: null,
  endAt: null,
  createdAt: "2026-06-25T09:00:00.000Z",
};

export const Empty: Story = {
  name: "공지사항 없음",
  beforeEach: () => {
    mockApi.onGet(BOARD.LIST).reply(...ok({ result: [], page: 1, limit: 5, totalCount: 0, hasMore: false }));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "공지사항" }));
    await expect(await body.findByText("공지사항이 없습니다.")).toBeInTheDocument();
  },
};

export const WithData: Story = {
  name: "최근 공지 목록",
  beforeEach: () => {
    mockApi.onGet(BOARD.LIST).reply(
      ...ok({
        result: [pinnedNotice, recentNotice],
        page: 1,
        limit: 5,
        totalCount: 2,
        hasMore: false,
      })
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "공지사항" }));
    await expect(await body.findByText("서비스 정기 점검 안내")).toBeInTheDocument();
    await expect(body.getByText("여름 이벤트 안내")).toBeInTheDocument();
    await expect(body.getByText("전체보기")).toBeInTheDocument();
  },
};
