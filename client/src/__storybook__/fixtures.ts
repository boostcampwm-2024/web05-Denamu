// Shared mock data for Storybook stories.
// Not part of the app bundle or test coverage scope (coverage targets components/** & hooks/**).
import { FileText, Sparkles } from "lucide-react";

import type { FeatureItem } from "@/types/about";
import type { DayInfo, WeekInfo } from "@/types/activity";
import type { ChartPlatform } from "@/types/chart";
import type { ChatType } from "@/types/chat";
import type { FeedDetail, FeedList } from "@/types/post";
import type { CertifiedRss, User } from "@/types/profile";
import type { AdminRssData } from "@/types/rss";
import type { SearchResult, UserSearchResult } from "@/types/search";

export const mockFeedList: FeedList = {
  id: 1,
  createdAt: "2026-06-20T09:00:00.000Z",
  title: "Storybook으로 컴포넌트 문서화하기",
  viewCount: 1234,
  path: "https://example.com/post/1",
  author: "데나무",
  thumbnail: "https://picsum.photos/seed/denamu/400/240",
  authorImageUrl: "https://picsum.photos/seed/author/80/80",
  tag: ["React", "Storybook", "TypeScript"],
  likes: 42,
  comments: 7,
  blogPlatform: "tistory",
  isNew: true,
};

export const mockFeedDetail: FeedDetail = {
  ...mockFeedList,
  summary: "이 글은 Storybook을 활용해 프론트엔드 컴포넌트를 문서화하고 테스트하는 방법을 다룹니다.",
  isOwner: false,
};

export const mockUser: User = {
  name: "조민석",
  email: "denamu@example.com",
  avatar: "https://picsum.photos/seed/user/120/120",
  bio: "기술 블로그를 운영하는 개발자입니다.",
  blogUrl: "https://denamu.dev",
  rssRegistered: true,
  lastPosted: "2026-06-22T09:00:00.000Z",
  totalPosts: 42,
  totalViews: 98765,
  topics: ["React", "Node.js", "Infra"],
  dailyActivities: [
    { date: "2026-06-20", viewCount: 12 },
    { date: "2026-06-21", viewCount: 30 },
    { date: "2026-06-22", viewCount: 8 },
  ],
  streakCount: 7,
  longestStreak: 30,
};

export const mockCertifiedRss: CertifiedRss = {
  id: 1,
  name: "데나무 블로그",
  userName: "조민석",
  rssUrl: "https://denamu.dev/rss",
  blogPlatform: "tistory",
  feedCount: 42,
};

export const mockChatItem: ChatType = {
  chatImg: "https://picsum.photos/seed/chat/64/64",
  userName: "데나무",
  timestamp: "2026-06-25T09:00:00.000Z",
  message: "안녕하세요! Storybook 데모 메시지입니다.",
  userId: "user-1",
  messageId: "msg-1",
  isSend: false,
};

export const mockSearchResult: SearchResult = {
  id: 1,
  title: "Storybook으로 컴포넌트 문서화하기",
  blogName: "데나무 블로그",
  path: "https://example.com/post/1",
  createdAt: "2026-06-20T09:00:00.000Z",
  author: "조민석",
  blogPlatform: "tistory",
  thumbnail: "https://picsum.photos/seed/search/400/240",
  viewCount: 1234,
  tag: ["React", "Storybook"],
  likes: 42,
  comments: 7,
};

export const mockUserSearchResult: UserSearchResult = {
  id: 1,
  userName: "조민석",
  profileImage: "https://picsum.photos/seed/usearch/80/80",
};

export const mockAdminRssList: AdminRssData[] = [
  {
    id: 1,
    name: "데나무 블로그",
    userName: "조민석",
    email: "denamu@example.com",
    rssUrl: "https://denamu.dev/rss",
    description: "기술 블로그",
  },
  {
    id: 2,
    name: "벨로그 블로그",
    userName: "홍길동",
    email: "hong@example.com",
    rssUrl: "https://velog.io/@hong/rss",
  },
];

export const mockFeatureItem: FeatureItem = {
  shortTitle: "실시간 트렌딩",
  longTitle: "실시간 트렌딩 포스트",
  description: "개발자들이 지금 가장 많이 보는 글을 실시간으로 확인하세요.",
  icon: Sparkles,
};

export const mockChartPlatforms: ChartPlatform[] = [
  { platform: "tistory", count: 120 },
  { platform: "velog", count: 80 },
  { platform: "medium", count: 40 },
];

export const mockPlatforms = [
  { value: "tistory", label: "Tistory" },
  { value: "velog", label: "Velog" },
  { value: "medium", label: "Medium" },
];

const makeDay = (day: number, count: number): DayInfo => {
  const date = new Date(2026, 5, day);
  return {
    date,
    dateStr: `2026-06-${String(day).padStart(2, "0")}`,
    count,
    empty: false,
  };
};

export const mockWeekInfo: WeekInfo = {
  weekNumber: 1,
  days: [
    makeDay(1, 0),
    makeDay(2, 2),
    makeDay(3, 5),
    makeDay(4, 1),
    makeDay(5, 8),
    makeDay(6, 3),
    makeDay(7, 0),
  ],
};

export const mockDayInfo: DayInfo = makeDay(5, 8);

export const mockWeeks: WeekInfo[] = [
  mockWeekInfo,
  { weekNumber: 2, days: Array.from({ length: 7 }, (_, i) => makeDay(8 + i, i)) },
];

export const mockSidebarIcon = FileText;

export const mockDailyActivities = mockUser.dailyActivities;
