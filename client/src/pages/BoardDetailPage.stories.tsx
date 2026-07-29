import BoardDetailPage from "@/pages/BoardDetailPage";

import { BOARD } from "@/constants/endpoints";

import { mockBoardDetail } from "@/__storybook__/fixtures";
import { fail, mockApi, ok } from "@/__storybook__/mockApi";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

const meta = {
  title: "pages/BoardDetailPage",
  component: BoardDetailPage,
  parameters: {
    router: { path: "/board/:id", initialEntries: [`/board/${mockBoardDetail.id}`] },
  },
} satisfies Meta<typeof BoardDetailPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  beforeEach: () => {
    mockApi.onGet(BOARD.DETAIL(mockBoardDetail.id)).reply(...ok(mockBoardDetail));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText(mockBoardDetail.title)).toBeInTheDocument();
    await expect(canvas.getByText("정기 점검으로 인해 서비스 이용이 일시 중단됩니다.")).toBeInTheDocument();
  },
};

export const NotFound: Story = {
  name: "존재하지 않거나 접근 불가",
  beforeEach: () => {
    mockApi.onGet(BOARD.DETAIL(mockBoardDetail.id)).reply(...fail(404, "존재하지 않는 공지사항입니다."));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("존재하지 않거나 접근할 수 없는 공지사항입니다.")).toBeInTheDocument();
  },
};
