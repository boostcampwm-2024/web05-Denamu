import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { PostHeader } from "@/components/common/Card/detail/PostHeader";
import { REPORT } from "@/constants/endpoints";
import { mockFeedDetail } from "@/__storybook__/fixtures";
import { mockApi, ok } from "@/__storybook__/mockApi";
import { useAuthStore } from "@/store/useAuthStore";

const meta = {
  title: "common/Card/detail/PostHeader",
  component: PostHeader,
  args: { data: mockFeedDetail },
} satisfies Meta<typeof PostHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

const resetAuth = () => {
  useAuthStore.setState({
    isAuthenticated: false,
    role: "guest",
    userInfo: { id: null, email: null, userName: null },
  });
};

export const Default: Story = {};

export const ReportFlow: Story = {
  name: "신고하기 플로우 (로그인 방문자)",
  beforeEach: () => {
    useAuthStore.setState({
      isInitialized: true,
      isAuthenticated: true,
      role: "user",
      userInfo: { id: 1, email: "me@test.com", userName: "테스터" },
    });
    mockApi.onPost(REPORT.FEED(mockFeedDetail.id)).reply(...ok(null));
    return resetAuth;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole("button", { name: "더보기" }));
    await userEvent.click(await body.findByRole("menuitem", { name: "신고하기" }));
    await userEvent.click(await body.findByRole("combobox"));
    await userEvent.click(await body.findByRole("option", { name: "음란물/불건전한 콘텐츠" }));
    await userEvent.click(await body.findByRole("button", { name: "신고하기" }));

    await waitFor(() => expect(mockApi.history.post).toHaveLength(1));
  },
};
