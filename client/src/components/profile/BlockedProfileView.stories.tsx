import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { BlockedProfileView } from "@/components/profile/BlockedProfileView";
import { BLOCK } from "@/constants/endpoints";
import { mockApi, ok, fail } from "@/__storybook__/mockApi";

const meta = {
  title: "profile/BlockedProfileView",
  component: BlockedProfileView,
  args: { userId: 2 },
} satisfies Meta<typeof BlockedProfileView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Unblock: Story = {
  name: "차단 해제 클릭",
  beforeEach: () => {
    mockApi.onDelete(BLOCK.MANAGE(2)).reply(...ok(null));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "차단 해제" }));
    await waitFor(() => expect(mockApi.history.delete).toHaveLength(1));
  },
};

export const UnblockError: Story = {
  name: "차단 해제 실패",
  beforeEach: () => {
    mockApi.onDelete(BLOCK.MANAGE(2)).reply(...fail());
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "차단 해제" }));
  },
};
