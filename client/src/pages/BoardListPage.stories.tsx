import BoardListPage from "@/pages/BoardListPage";

import { BOARD, QNA } from "@/constants/endpoints";

import { mockBoardsPage, mockQnaPage } from "@/__storybook__/fixtures";
import { fail, mockApi, ok } from "@/__storybook__/mockApi";
import { useAuthStore } from "@/store/useAuthStore";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

const EMPTY_QNA_PAGE = { result: [], page: 1, limit: 10, totalCount: 0, hasMore: false };

const meta = {
  title: "pages/BoardListPage",
  component: BoardListPage,
  parameters: {
    router: { initialEntries: ["/board"] },
  },
} satisfies Meta<typeof BoardListPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithData: Story = {
  name: "공지사항 목록 있음",
  beforeEach: () => {
    mockApi.onGet(BOARD.LIST).reply(...ok(mockBoardsPage));
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
    mockApi.onGet(BOARD.LIST).reply(...ok({ result: [], page: 1, limit: 10, totalCount: 0, hasMore: false }));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("등록된 공지사항이 없습니다.")).toBeInTheDocument();
  },
};

export const Error: Story = {
  name: "오류",
  beforeEach: () => {
    mockApi.onGet(BOARD.LIST).reply(...fail());
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("공지사항을 불러오지 못했습니다.")).toBeInTheDocument();
  },
};

export const Pagination: Story = {
  name: "페이지네이션",
  beforeEach: () => {
    mockApi.onGet(BOARD.LIST).reply((config) => {
      const page = (config.params?.page as number | undefined) ?? 1;
      return ok({ ...mockBoardsPage, page, totalCount: 25 });
    });
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("1 / 3")).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: "다음" }));
    await expect(await canvas.findByText("2 / 3")).toBeInTheDocument();
  },
};

export const QnaTab: Story = {
  name: "Q&A 탭",
  beforeEach: () => {
    mockApi.onGet(BOARD.LIST).reply(...ok(mockBoardsPage));
    mockApi.onGet(QNA.LIST).reply(...ok(mockQnaPage));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText("서비스 정기 점검 안내");

    await userEvent.click(canvas.getByRole("tab", { name: "Q&A" }));

    await expect(await canvas.findByText("구독한 블로그 글이 늦게 반영돼요")).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "문의하기" })).toBeInTheDocument();
  },
};

export const QnaCreateFlow: Story = {
  name: "Q&A 문의 등록 (비회원)",
  beforeEach: () => {
    useAuthStore.setState({ role: "guest" });
    mockApi.onGet(BOARD.LIST).reply(...ok(mockBoardsPage));
    mockApi.onGet(QNA.LIST).reply(...ok(EMPTY_QNA_PAGE));
    mockApi.onPost(QNA.LIST).reply(...ok({ id: 42 }, "문의가 성공적으로 등록되었습니다."));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("tab", { name: "Q&A" }));
    await userEvent.click(canvas.getByRole("button", { name: "문의하기" }));

    const submitButton = await canvas.findByRole("button", { name: "등록" });
    expect(submitButton).toBeDisabled();

    await userEvent.type(canvas.getByPlaceholderText("제목을 입력하세요"), "RSS 등록은 어떻게 하나요?");
    await userEvent.type(canvas.getByPlaceholderText("문의 내용을 입력하세요"), "RSS 주소 등록 절차가 궁금합니다.");
    await userEvent.type(canvas.getByPlaceholderText("닉네임"), "김개발");
    await userEvent.type(canvas.getByPlaceholderText("답변 알림을 받을 이메일"), "guest@example.com");
    await userEvent.type(canvas.getByPlaceholderText("추가 질문/열람 시 필요한 비밀번호"), "qna1234");
    await userEvent.click(canvas.getByLabelText(/개인정보처리방침/));

    await expect(submitButton).not.toBeDisabled();
    await userEvent.click(submitButton);

    await expect(await canvas.findByRole("tab", { name: "Q&A" })).toBeInTheDocument();
  },
};

export const QnaCreateSecretRequiresPassword: Story = {
  name: "Q&A 비공개 문의 - 비밀번호 필수",
  beforeEach: () => {
    useAuthStore.setState({ role: "user", userInfo: { id: 1, email: "user@example.com", userName: "회원" } });
    mockApi.onGet(BOARD.LIST).reply(...ok(mockBoardsPage));
    mockApi.onGet(QNA.LIST).reply(...ok(EMPTY_QNA_PAGE));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("tab", { name: "Q&A" }));
    await userEvent.click(canvas.getByRole("button", { name: "문의하기" }));

    const submitButton = await canvas.findByRole("button", { name: "등록" });
    await userEvent.type(canvas.getByPlaceholderText("제목을 입력하세요"), "결제 관련 비공개 문의입니다");
    await userEvent.type(canvas.getByPlaceholderText("문의 내용을 입력하세요"), "결제 내역을 비공개로 문의드립니다.");

    // 회원 + 공개 상태에서는 비밀번호 입력란이 없고 바로 등록 가능해야 한다.
    await expect(canvas.queryByPlaceholderText("추가 질문/열람 시 필요한 비밀번호")).not.toBeInTheDocument();
    await expect(submitButton).not.toBeDisabled();

    await userEvent.click(canvas.getByLabelText("비공개로 작성"));

    // 비공개로 전환하면 회원이어도 비밀번호를 입력하기 전까지 등록 버튼이 비활성화된다.
    await expect(await canvas.findByPlaceholderText("추가 질문/열람 시 필요한 비밀번호")).toBeInTheDocument();
    await expect(submitButton).toBeDisabled();

    await userEvent.type(canvas.getByPlaceholderText("추가 질문/열람 시 필요한 비밀번호"), "secret12");
    await expect(submitButton).not.toBeDisabled();
  },
};
