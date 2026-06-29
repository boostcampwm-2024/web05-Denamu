import type { Meta, StoryObj } from "@storybook/react-vite";

import Home from "@/pages/Home";

import { BLOG } from "@/constants/endpoints";

import { fail, mockApi, ok } from "@/__storybook__/mockApi";
import { mockFeedList } from "@/__storybook__/fixtures";

const meta = {
  title: "pages/Home",
  component: Home,
} satisfies Meta<typeof Home>;

export default meta;
type Story = StoryObj<typeof meta>;

// 최신 피드는 HTTP로 mock. 트렌딩은 SSE(EventSource)라 mock 불가 → 빈 상태로 표시됨.
export const Success: Story = {
  beforeEach: () => {
    mockApi.onGet(BLOG.POST).reply(
      ...ok(
        {
          result: [mockFeedList, { ...mockFeedList, id: 2, title: "두 번째 최신 글" }],
          hasMore: false,
          lastId: null,
        },
        "피드 조회 완료"
      )
    );
  },
};

export const Error: Story = {
  beforeEach: () => {
    mockApi.onGet(BLOG.POST).reply(...fail(500, "피드 조회 실패"));
  },
};
