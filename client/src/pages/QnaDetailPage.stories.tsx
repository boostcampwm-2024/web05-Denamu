import QnaDetailPage from "@/pages/QnaDetailPage";

import { QNA } from "@/constants/endpoints";

import { mockQnaThread } from "@/__storybook__/fixtures";
import { fail, mockApi, ok } from "@/__storybook__/mockApi";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "pages/QnaDetailPage",
  component: QnaDetailPage,
  parameters: {
    router: { path: "/qna/:id", initialEntries: [`/qna/${mockQnaThread.id}`] },
  },
} satisfies Meta<typeof QnaDetailPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Answered: Story = {
  name: "답변완료 스레드",
  beforeEach: () => {
    mockApi.onGet(QNA.DETAIL(mockQnaThread.id)).reply(...ok(mockQnaThread));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText(mockQnaThread.title)).toBeInTheDocument();
    await expect(canvas.getByText("관리자 운영팀")).toBeInTheDocument();
    await expect(canvas.getByText("추가 질문하기")).toBeInTheDocument();
  },
};

export const Locked: Story = {
  name: "비공개 - 비밀번호 잠금",
  beforeEach: () => {
    mockApi
      .onGet(QNA.DETAIL(mockQnaThread.id))
      .reply(...ok({ id: mockQnaThread.id, title: "비공개 문의입니다", isSecret: true, requiresPassword: true }));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("비공개로 작성된 문의입니다. 비밀번호를 입력해주세요.")).toBeInTheDocument();
  },
};

export const VerifyFailure: Story = {
  name: "비밀번호 오류",
  beforeEach: () => {
    mockApi
      .onGet(QNA.DETAIL(mockQnaThread.id))
      .reply(...ok({ id: mockQnaThread.id, title: "비공개 문의입니다", isSecret: true, requiresPassword: true }));
    mockApi.onPost(QNA.VERIFY(mockQnaThread.id)).reply(...fail(401, "비밀번호가 일치하지 않습니다."));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByPlaceholderText("비밀번호");
    await userEvent.type(canvas.getByPlaceholderText("비밀번호"), "wrong");
    await userEvent.click(canvas.getByRole("button", { name: "확인" }));

    await waitFor(() => expect(canvas.getByPlaceholderText("비밀번호")).toBeInTheDocument());
  },
};

export const NotFound: Story = {
  name: "존재하지 않음",
  beforeEach: () => {
    mockApi.onGet(QNA.DETAIL(mockQnaThread.id)).reply(...fail(404, "존재하지 않는 문의입니다."));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("존재하지 않는 문의입니다.")).toBeInTheDocument();
  },
};
