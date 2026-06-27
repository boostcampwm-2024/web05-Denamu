import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { CertifiedRssList } from "@/components/profile/CertifiedRssList";
import { PROFILE } from "@/constants/endpoints";
import { mockCertifiedRss } from "@/__storybook__/fixtures";
import { mockApi, ok, fail } from "@/__storybook__/mockApi";

const mockRssFeeds = {
  result: [
    { id: 1, title: "첫 번째 포스트", createdAt: "2026-06-20T09:00:00.000Z", commentCount: 2, likeCount: 10 },
    { id: 2, title: "두 번째 포스트", createdAt: "2026-06-21T09:00:00.000Z", commentCount: 0, likeCount: 5 },
  ],
  lastId: 2,
  hasMore: false,
};

const meta = {
  title: "profile/CertifiedRssList",
  component: CertifiedRssList,
  args: { userId: 1, rssList: [mockCertifiedRss] },
} satisfies Meta<typeof CertifiedRssList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  beforeEach: () => {
    mockApi.onGet(PROFILE.RSS_FEEDS(1, mockCertifiedRss.id)).reply(...ok(mockRssFeeds));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "게시글 목록 펼치기" }));
    await expect(await canvas.findByText("첫 번째 포스트")).toBeInTheDocument();
  },
};

export const MultipleRss: Story = {
  name: "RSS 여러 개",
  args: {
    rssList: [
      mockCertifiedRss,
      { ...mockCertifiedRss, id: 2, name: "두 번째 블로그", rssUrl: "https://velog.io/@user/rss", blogPlatform: "velog" as const, feedCount: 12 },
    ],
  },
  beforeEach: () => {
    mockApi.onGet(PROFILE.RSS_FEEDS(1, 1)).reply(...ok(mockRssFeeds));
    mockApi.onGet(PROFILE.RSS_FEEDS(1, 2)).reply(...ok({ ...mockRssFeeds, result: mockRssFeeds.result.slice(0, 1) }));
  },
};

export const Empty: Story = {
  name: "RSS 없음",
  args: { rssList: [] },
};

export const FeedError: Story = {
  name: "게시글 로드 실패",
  beforeEach: () => {
    mockApi.onGet(PROFILE.RSS_FEEDS(1, mockCertifiedRss.id)).reply(...fail(500, "게시글을 불러오지 못했습니다."));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "게시글 목록 펼치기" }));
    await expect(await canvas.findByText("게시글을 불러오지 못했습니다.")).toBeInTheDocument();
  },
};
