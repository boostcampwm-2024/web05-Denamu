import AdminQnaTab from "@/components/admin/qna/AdminQnaTab";

import { QNA } from "@/constants/endpoints";

import { mockQnaPage, mockQnaThread } from "@/__storybook__/fixtures";
import { fail, mockApi, ok } from "@/__storybook__/mockApi";
import { QnaStatus } from "@/types/qna";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "admin/qna/AdminQnaTab",
  component: AdminQnaTab,
} satisfies Meta<typeof AdminQnaTab>;

export default meta;
type Story = StoryObj<typeof meta>;

const setupFilterableQna = () => {
  mockApi.onGet(QNA.ADMIN_LIST).reply((config) => {
    const status = config.params?.status as QnaStatus | undefined;
    const filtered = status ? mockQnaPage.result.filter((qna) => qna.status === status) : mockQnaPage.result;
    return ok({ ...mockQnaPage, result: filtered, totalCount: filtered.length });
  });
};

export const WithData: Story = {
  name: "Q&A 목록 있음",
  beforeEach: setupFilterableQna,
};

export const Empty: Story = {
  name: "Q&A 없음",
  beforeEach: () => {
    mockApi.onGet(QNA.ADMIN_LIST).reply(...ok({ result: [], page: 1, limit: 10, totalCount: 0, hasMore: false }));
  },
};

export const Error: Story = {
  name: "오류",
  beforeEach: () => {
    mockApi.onGet(QNA.ADMIN_LIST).reply(...fail());
  },
};

export const AnswerFlow: Story = {
  name: "문의 선택 후 답변 등록",
  beforeEach: () => {
    setupFilterableQna();
    mockApi.onGet(QNA.ADMIN_DETAIL(mockQnaThread.id)).reply(...ok(mockQnaThread));
    mockApi.onPost(QNA.ADMIN_MESSAGES(mockQnaThread.id)).reply(...ok(mockQnaThread));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByText(mockQnaThread.title));

    await waitFor(() => expect(canvas.getByPlaceholderText("답변을 입력하세요")).toBeInTheDocument());
    await userEvent.type(canvas.getByPlaceholderText("답변을 입력하세요"), "확인 후 답변드리겠습니다.");
    await userEvent.click(canvas.getByRole("button", { name: "답변 등록" }));
  },
};
