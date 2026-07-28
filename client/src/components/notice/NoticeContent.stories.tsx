import { NoticeContent } from "@/components/notice/NoticeContent";

import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

const meta = {
  title: "notice/NoticeContent",
  component: NoticeContent,
} satisfies Meta<typeof NoticeContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RichText: Story = {
  name: "서식 있는 본문 (색상 포함)",
  args: {
    content:
      '<h1>정기 점검 안내</h1><p>안녕하세요, 데나무입니다.</p><p><span style="color: rgb(230, 0, 0);">7월 30일 새벽 2시부터 4시까지</span> 서버 점검이 진행됩니다.</p><ul><li>점검 시간: 02:00 ~ 04:00</li><li>영향: 서비스 접속 불가</li></ul><p><a href="https://denamu.dev">문의하기</a></p>',
  },
};

export const SanitizesScript: Story = {
  name: "script/이벤트 핸들러 제거",
  args: {
    content: '<p>안내 문구</p><script>alert("xss")</script><img src="x" onerror="alert(1)" />',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("안내 문구")).toBeInTheDocument();
    await expect(canvasElement.querySelector("script")).not.toBeInTheDocument();
    await expect(canvasElement.querySelector("img")?.getAttribute("onerror")).toBeNull();
  },
};
