import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { AdminTabs } from "@/components/admin/layout/AdminTabs";
import { ADMIN } from "@/constants/endpoints";
import { mockAdminRssList } from "@/__storybook__/fixtures";
import { mockApi, ok, fail } from "@/__storybook__/mockApi";

const meta = {
  title: "admin/layout/AdminTabs",
  component: AdminTabs,
  args: { setLogout: fn() },
} satisfies Meta<typeof AdminTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const setupSuccess = () => {
  mockApi.onGet(ADMIN.GET.RSS).reply(...ok(mockAdminRssList));
  mockApi.onGet(ADMIN.GET.ACCEPT).reply(...ok(mockAdminRssList.slice(0, 1)));
  mockApi.onGet(ADMIN.GET.REJECT).reply(...ok([]));
  mockApi.onPost(/\/api\/rss\/accept\/\d+/).reply(...ok({ message: "승인되었습니다." }));
  mockApi.onPost(/\/api\/rss\/reject\/\d+/).reply(...ok({ message: "거부되었습니다." }));
};

export const WithPending: Story = {
  name: "대기 중 RSS 있음",
  beforeEach: setupSuccess,
};

export const AcceptPending: Story = {
  name: "대기 RSS 승인",
  beforeEach: setupSuccess,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const approveButtons = await canvas.findAllByRole("button", { name: "승인" });
    await userEvent.click(approveButtons[0]);
    await expect(mockApi.history.post).toHaveLength(1);
  },
};

export const RejectPending: Story = {
  name: "대기 RSS 거부",
  beforeEach: setupSuccess,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const rejectButtons = await canvas.findAllByRole("button", { name: "거부" });
    await userEvent.click(rejectButtons[0]);
    await userEvent.type(await body.findByPlaceholderText("거부 사유를 입력하세요..."), "기술 블로그가 아닙니다.");
    await userEvent.click(body.getByRole("button", { name: "거부하기" }));
    await expect(mockApi.history.post).toHaveLength(1);
  },
};

export const AllEmpty: Story = {
  name: "모든 탭 비어있음",
  beforeEach: () => {
    mockApi.onGet(ADMIN.GET.RSS).reply(...ok([]));
    mockApi.onGet(ADMIN.GET.ACCEPT).reply(...ok([]));
    mockApi.onGet(ADMIN.GET.REJECT).reply(...ok([]));
    mockApi.onPost(/\/api\/rss\/accept\/\d+/).reply(...ok({ message: "승인되었습니다." }));
    mockApi.onPost(/\/api\/rss\/reject\/\d+/).reply(...ok({ message: "거부되었습니다." }));
  },
};

export const Loading: Story = {
  name: "로딩 중",
  beforeEach: () => {
    mockApi.onGet(ADMIN.GET.RSS).reply(() => new Promise(() => {}));
    mockApi.onGet(ADMIN.GET.ACCEPT).reply(() => new Promise(() => {}));
    mockApi.onGet(ADMIN.GET.REJECT).reply(() => new Promise(() => {}));
  },
};

export const Error: Story = {
  name: "오류 (세션 만료)",
  beforeEach: () => {
    mockApi.onGet(ADMIN.GET.RSS).reply(...fail(401, "세션이 만료되었습니다."));
    mockApi.onGet(ADMIN.GET.ACCEPT).reply(...fail(401, "세션이 만료되었습니다."));
    mockApi.onGet(ADMIN.GET.REJECT).reply(...fail(401, "세션이 만료되었습니다."));
  },
};
