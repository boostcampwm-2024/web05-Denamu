import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { RssEditModal } from "@/components/profile/rss/RssEditModal";
import { mockCertifiedRss } from "@/__storybook__/fixtures";
import { mockApi, ok, fail } from "@/__storybook__/mockApi";

const meta = {
  title: "profile/rss/RssEditModal",
  component: RssEditModal,
  args: { target: mockCertifiedRss, userId: 1, onClose: fn() },
} satisfies Meta<typeof RssEditModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "수정 모달",
  beforeEach: () => {
    mockApi.onPatch(/\/api\/rss\/certifications\/\d+/).reply(...ok({ message: "수정되었습니다." }));
  },
};

export const SaveFlow: Story = {
  name: "이름 수정 → 저장",
  beforeEach: () => {
    mockApi.onPatch(/\/api\/rss\/certifications\/\d+/).reply(...ok({ message: "수정되었습니다." }));
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const nameInput = await body.findByLabelText("블로그 이름");
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "수정된 블로그");
    await userEvent.click(body.getByRole("button", { name: "저장" }));
    await expect(mockApi.history.patch).toHaveLength(1);
  },
};

export const SaveError: Story = {
  name: "저장 실패",
  beforeEach: () => {
    mockApi.onPatch(/\/api\/rss\/certifications\/\d+/).reply(...fail(400, "이미 사용 중인 블로그 이름입니다."));
  },
};

export const Closed: Story = {
  name: "닫힌 상태",
  args: { target: null },
};
