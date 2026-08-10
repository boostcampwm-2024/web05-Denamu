import AdminSuspensionTab from "@/components/admin/suspension/AdminSuspensionTab";

import { SUSPENSION } from "@/constants/endpoints";

import { mockSuspendedUsersPage } from "@/__storybook__/fixtures";
import { fail, mockApi, ok } from "@/__storybook__/mockApi";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

const meta = {
  title: "admin/suspension/AdminSuspensionTab",
  component: AdminSuspensionTab,
} satisfies Meta<typeof AdminSuspensionTab>;

export default meta;
type Story = StoryObj<typeof meta>;

const setupSuspensions = () => {
  mockApi.onGet(SUSPENSION.ADMIN_LIST).reply(...ok(mockSuspendedUsersPage));
};

export const WithData: Story = {
  name: "정지 유저 있음",
  beforeEach: setupSuspensions,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText(/스팸유저/)).toBeInTheDocument();
    await expect(canvas.getByText(/영구 정지/)).toBeInTheDocument();
    await expect(canvas.getByText(/까지 정지/)).toBeInTheDocument();
  },
};

export const Empty: Story = {
  name: "정지 유저 없음",
  beforeEach: () => {
    mockApi.onGet(SUSPENSION.ADMIN_LIST).reply(...ok({ result: [], lastId: 0, hasMore: false }));
  },
};

export const Loading: Story = {
  name: "로딩 중",
  beforeEach: () => {
    mockApi.onGet(SUSPENSION.ADMIN_LIST).reply(() => new Promise(() => {}));
  },
};

export const Error: Story = {
  name: "오류",
  beforeEach: () => {
    mockApi.onGet(SUSPENSION.ADMIN_LIST).reply(...fail());
  },
};
