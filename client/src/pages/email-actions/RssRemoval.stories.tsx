import type { Meta, StoryObj } from "@storybook/react-vite";

import RssRemoval from "@/pages/email-actions/RssRemoval";

import { fail, mockApi, ok } from "@/__storybook__/mockApi";

const ENDPOINT = /\/api\/rss\/remove\/.+/;

const clickConfirm = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const btn = [...canvasElement.querySelectorAll("button")].find((b) => b.textContent?.includes("삭제 확인"));
  btn?.click();
};

const meta = {
  title: "pages/email-actions/RssRemoval",
  component: RssRemoval,
  parameters: {
    router: { initialEntries: ["/rss/removal?code=test-code"] },
  },
} satisfies Meta<typeof RssRemoval>;

export default meta;
type Story = StoryObj<typeof meta>;

// 삭제는 버튼 클릭으로 트리거됨 — Default는 확인 화면.
export const Default: Story = {};

export const Success: Story = {
  beforeEach: () => {
    mockApi.onDelete(ENDPOINT).reply(...ok(null, "삭제 완료"));
  },
  play: clickConfirm,
};

export const Error: Story = {
  beforeEach: () => {
    mockApi.onDelete(ENDPOINT).reply(...fail(400, "삭제 링크가 유효하지 않습니다."));
  },
  play: clickConfirm,
};
