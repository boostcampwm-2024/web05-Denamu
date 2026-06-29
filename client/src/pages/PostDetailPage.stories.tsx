import type { Meta, StoryObj } from "@storybook/react-vite";

import PostDetailPage from "@/pages/PostDetailPage";

import { fail, mockApi, ok } from "@/__storybook__/mockApi";
import { mockFeedDetail } from "@/__storybook__/fixtures";

const meta = {
  title: "pages/PostDetailPage",
  component: PostDetailPage,
  parameters: {
    router: { path: "/:id", initialEntries: ["/1"] },
  },
} satisfies Meta<typeof PostDetailPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  beforeEach: () => {
    mockApi.onGet("/api/feeds/1").reply(...ok(mockFeedDetail, "피드 상세 조회 완료"));
  },
};

// 조회 실패 시 페이지는 NotFound 화면을 렌더한다.
export const Error: Story = {
  beforeEach: () => {
    mockApi.onGet("/api/feeds/1").reply(...fail(404, "게시글을 찾을 수 없습니다."));
  },
};
