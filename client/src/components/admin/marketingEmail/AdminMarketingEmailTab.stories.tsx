import AdminMarketingEmailTab from "@/components/admin/marketingEmail/AdminMarketingEmailTab";

import { MARKETING_EMAIL } from "@/constants/endpoints";

import { mockMarketingEmailDetails, mockMarketingEmailsPage } from "@/__storybook__/fixtures";
import { fail, mockApi, ok } from "@/__storybook__/mockApi";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "admin/marketingEmail/AdminMarketingEmailTab",
  component: AdminMarketingEmailTab,
} satisfies Meta<typeof AdminMarketingEmailTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithHistory: Story = {
  name: "발송 이력 있음",
  beforeEach: () => {
    mockApi.onGet(MARKETING_EMAIL.ADMIN_LIST).reply(...ok(mockMarketingEmailsPage));
    mockMarketingEmailDetails.forEach((detail) => {
      mockApi.onGet(MARKETING_EMAIL.ADMIN_DETAIL(detail.id)).reply(...ok(detail));
    });
  },
};

export const HistoryDetail: Story = {
  name: "발송 이력 카드를 펼쳐 본문 확인",
  beforeEach: () => {
    mockApi.onGet(MARKETING_EMAIL.ADMIN_LIST).reply(...ok(mockMarketingEmailsPage));
    mockMarketingEmailDetails.forEach((detail) => {
      mockApi.onGet(MARKETING_EMAIL.ADMIN_DETAIL(detail.id)).reply(...ok(detail));
    });
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const target = mockMarketingEmailDetails[0];

    await userEvent.click(await canvas.findByText(target.subject));

    await waitFor(() => expect(canvas.getByText(/안녕하세요!/)).toBeInTheDocument());
  },
};

export const Empty: Story = {
  name: "발송 이력 없음",
  beforeEach: () => {
    mockApi
      .onGet(MARKETING_EMAIL.ADMIN_LIST)
      .reply(...ok({ result: [], page: 1, limit: 10, totalCount: 0, hasMore: false }));
  },
};

export const Loading: Story = {
  name: "로딩 중",
  beforeEach: () => {
    mockApi.onGet(MARKETING_EMAIL.ADMIN_LIST).reply(() => new Promise(() => {}));
  },
};

export const Error: Story = {
  name: "오류",
  beforeEach: () => {
    mockApi.onGet(MARKETING_EMAIL.ADMIN_LIST).reply(...fail());
  },
};

export const SendDisabledUntilBothFilled: Story = {
  name: "제목만 입력해도 발송 버튼은 비활성 상태 유지",
  beforeEach: () => {
    mockApi
      .onGet(MARKETING_EMAIL.ADMIN_LIST)
      .reply(...ok({ result: [], page: 1, limit: 10, totalCount: 0, hasMore: false }));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole("button", { name: "발송" })).toBeDisabled();

    await userEvent.type(canvas.getByLabelText("제목"), "새 소식");
    await waitFor(() => expect(canvas.getByRole("button", { name: "발송" })).toBeDisabled());
  },
};
