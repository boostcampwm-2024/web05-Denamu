import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { BLOCK } from "@/constants/endpoints";
import { mockApi, ok } from "@/__storybook__/mockApi";

const meta = {
  title: "profile/ProfileHeader",
  component: ProfileHeader,
  args: { name: "홍길동", email: "test@test.com", profileImage: null, introduction: null },
} satisfies Meta<typeof ProfileHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OtherUser: Story = {
  name: "타인 프로필 (차단 메뉴 노출)",
  args: { email: "", blockableUserId: 2 },
};

export const BlockFlow: Story = {
  name: "차단 플로우",
  args: { email: "", blockableUserId: 2 },
  beforeEach: () => {
    mockApi.onPost(BLOCK.MANAGE(2)).reply(...ok(null));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole("button", { name: "더보기" }));
    await userEvent.click(await body.findByRole("menuitem", { name: "차단" }, { timeout: 5000 }));
    await expect(await body.findByText("홍길동님을 차단하시겠습니까?", undefined, { timeout: 5000 })).toBeInTheDocument();
    await userEvent.click(body.getByRole("button", { name: "차단" }));

    await waitFor(() => expect(mockApi.history.post).toHaveLength(1));
  },
};

export const BlockCancel: Story = {
  name: "차단 취소",
  args: { email: "", blockableUserId: 2 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole("button", { name: "더보기" }));
    await userEvent.click(await body.findByRole("menuitem", { name: "차단" }, { timeout: 5000 }));
    await userEvent.click(await body.findByRole("button", { name: "취소" }, { timeout: 5000 }));

    await waitFor(() => expect(body.queryByText("홍길동님을 차단하시겠습니까?")).not.toBeInTheDocument());
    await expect(mockApi.history.post).toHaveLength(0);
  },
};
