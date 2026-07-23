import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { BlockManagementTab } from "@/components/profile/BlockManagementTab";
import { BLOCK } from "@/constants/endpoints";
import { mockBlockedUsers } from "@/__storybook__/fixtures";
import { mockApi, ok, fail } from "@/__storybook__/mockApi";

const meta = {
  title: "profile/BlockManagementTab",
  component: BlockManagementTab,
} satisfies Meta<typeof BlockManagementTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithData: Story = {
  name: "차단 목록 있음",
  beforeEach: () => {
    mockApi.onGet(BLOCK.LIST).reply(...ok(mockBlockedUsers));
  },
};

export const Empty: Story = {
  name: "차단 목록 없음",
  beforeEach: () => {
    mockApi.onGet(BLOCK.LIST).reply(...ok([]));
  },
};

export const Loading: Story = {
  name: "로딩 중",
  beforeEach: () => {
    mockApi.onGet(BLOCK.LIST).reply(() => new Promise(() => {}));
  },
};

export const Error: Story = {
  name: "오류",
  beforeEach: () => {
    mockApi.onGet(BLOCK.LIST).reply(...fail());
  },
};

export const Unblock: Story = {
  name: "차단 해제 클릭",
  beforeEach: () => {
    mockApi.onGet(BLOCK.LIST).reply(...ok(mockBlockedUsers));
    mockApi.onDelete(BLOCK.MANAGE(mockBlockedUsers[0].userId)).reply(...ok(null));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = await canvas.findAllByRole("button", { name: "차단 해제" });
    await userEvent.click(buttons[0]);
    await waitFor(() => expect(mockApi.history.delete).toHaveLength(1));
  },
};
