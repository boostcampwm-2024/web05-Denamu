import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import RssPage from "@/pages/RssPage";
import { BLOCK, BLOG } from "@/constants/endpoints";
import { mockApi, ok } from "@/__storybook__/mockApi";
import { useAuthStore } from "@/store/useAuthStore";

import { CursorPage, OwnedRssFeedItem, RssFeedItem, RssInfo } from "@/types/profile";

const meta = {
  title: "pages/RssPage",
  component: RssPage,
  parameters: {
    router: { initialEntries: ["/rss/5"], path: "/rss/:rssId" },
  },
} satisfies Meta<typeof RssPage>;

export default meta;
type Story = StoryObj<typeof meta>;

const RSS_ID = 5;

const feedsPage: CursorPage<RssFeedItem> = {
  result: Array.from({ length: 4 }, (_, i) => ({
    id: i + 1,
    title: `데나무 기술 블로그 게시글 ${i + 1}`,
    path: `https://blog.test/${i + 1}`,
    thumbnail: `https://picsum.photos/seed/rss${i}/240/160`,
    createdAt: "2025-01-15T00:00:00Z",
    commentCount: i,
    likeCount: i * 3,
  })),
  lastId: 1,
  hasMore: false,
};

const ownedFeedsPage: CursorPage<OwnedRssFeedItem> = {
  result: feedsPage.result.map((feed, i) => ({ ...feed, isPublic: i !== 1 })),
  lastId: 1,
  hasMore: false,
};

const baseRss: RssInfo = {
  id: RSS_ID,
  name: "데나무 블로그",
  userName: "조민석",
  rssUrl: "https://v2.velog.io/rss/@denamu",
  blogUrl: "https://velog.io/@denamu",
  blogPlatform: "velog",
  feedCount: 12,
  subscriberCount: 34,
  isSubscribed: false,
  isOwner: false,
  lastPublishedAt: "2025-01-15T00:00:00Z",
  owner: null,
  isBlocked: false,
  blogImage: null,
};

const resetAuth = () => {
  useAuthStore.setState({
    isAuthenticated: false,
    role: "guest",
    userInfo: { id: null, email: null, userName: null },
  });
};

const currentYear = new Date().getFullYear();
const activityData = {
  dailyActivities: [
    { date: `${currentYear}-01-05`, viewCount: 1 },
    { date: `${currentYear}-01-06`, viewCount: 3 },
    { date: `${currentYear}-02-10`, viewCount: 2 },
    { date: `${currentYear}-03-01`, viewCount: 5 },
  ],
};

const setupFeeds = () => {
  mockApi.onGet(BLOG.RSS.FEEDS(RSS_ID)).reply(...ok(feedsPage));
  mockApi.onGet(BLOG.RSS.OWNED_FEEDS(RSS_ID)).reply(...ok(ownedFeedsPage));
  mockApi.onGet(BLOG.RSS.ACTIVITY_YEARS(RSS_ID)).reply(...ok([currentYear]));
  mockApi.onGet(BLOG.RSS.ACTIVITIES(RSS_ID)).reply(...ok(activityData));
};

export const Unowned: Story = {
  name: "소유자 없는 RSS",
  beforeEach: () => {
    mockApi.onGet(BLOG.RSS.INFO(RSS_ID)).reply(...ok(baseRss));
    setupFeeds();
    return resetAuth;
  },
};

export const Certified: Story = {
  name: "인증된 RSS (방문자)",
  beforeEach: () => {
    mockApi
      .onGet(BLOG.RSS.INFO(RSS_ID))
      .reply(...ok({ ...baseRss, owner: { id: 99, userName: "김개발", profileImage: null } }));
    setupFeeds();
    return resetAuth;
  },
};

export const Blocked: Story = {
  name: "차단된 RSS",
  beforeEach: () => {
    useAuthStore.setState({
      isInitialized: true,
      isAuthenticated: true,
      role: "user",
      userInfo: { id: 1, email: "me@test.com", userName: "테스터" },
    });
    mockApi.onGet(BLOG.RSS.INFO(RSS_ID)).reply(...ok({ ...baseRss, isBlocked: true }));
    mockApi.onDelete(BLOCK.RSS_MANAGE(RSS_ID)).reply(...ok(null));
    setupFeeds();
    return resetAuth;
  },
};

export const BlockFlow: Story = {
  name: "차단하기 플로우 (로그인 방문자)",
  beforeEach: () => {
    useAuthStore.setState({
      isInitialized: true,
      isAuthenticated: true,
      role: "user",
      userInfo: { id: 1, email: "me@test.com", userName: "테스터" },
    });
    mockApi.onGet(BLOG.RSS.INFO(RSS_ID)).replyOnce(...ok(baseRss));
    mockApi.onGet(BLOG.RSS.INFO(RSS_ID)).reply(...ok({ ...baseRss, isBlocked: true }));
    mockApi.onPost(BLOCK.RSS_MANAGE(RSS_ID)).reply(...ok(null));
    mockApi.onDelete(BLOCK.RSS_MANAGE(RSS_ID)).reply(...ok(null));
    mockApi.onGet(BLOCK.RSS_LIST).reply(...ok([]));
    setupFeeds();
    return resetAuth;
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await body.findByRole("button", { name: "더보기" }));
    await userEvent.click(await body.findByRole("menuitem", { name: /차단하기/ }));
    await expect(
      await body.findByText("데나무 블로그 RSS를 차단하시겠습니까?")
    ).toBeInTheDocument();
    await userEvent.click(await body.findByRole("button", { name: "차단" }));
    await waitFor(() => expect(mockApi.history.post).toHaveLength(1));
    await expect(await body.findByText("차단된 RSS입니다.")).toBeInTheDocument();
  },
};

export const Owner: Story = {
  name: "본인 소유 RSS",
  beforeEach: () => {
    useAuthStore.setState({
      isInitialized: true,
      isAuthenticated: true,
      role: "user",
      userInfo: { id: 99, email: "me@test.com", userName: "김개발" },
    });
    mockApi
      .onGet(BLOG.RSS.INFO(RSS_ID))
      .reply(...ok({ ...baseRss, isOwner: true, owner: { id: 99, userName: "김개발", profileImage: null } }));
    setupFeeds();
    return resetAuth;
  },
};
