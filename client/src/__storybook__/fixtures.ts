import { FileText, Sparkles } from "lucide-react";

import type { FeatureItem } from "@/types/about";
import type { DayInfo, WeekInfo } from "@/types/activity";
import type { ChildAdmin } from "@/types/admin";
import type { ChartPlatform, ChartType } from "@/types/chart";
import type { AdminChatRoom, ChatType } from "@/types/chat";
import type { BoardDetail, BoardPage, BoardSummary } from "@/types/board";
import type { QnaPage, QnaSummary, QnaThread } from "@/types/qna";
import type { FeedDetail, FeedList } from "@/types/post";
import type {
  BlockedRss,
  BlockedUser,
  CertifiedRss,
  CommentItem,
  CursorPage,
  LikedItem,
  ProfileActivity,
  User,
  UserProfile,
} from "@/types/profile";
import type { ReportItem } from "@/types/report";
import type { AdminRssData, RecentRss } from "@/types/rss";
import type { RssSearchResult, SearchResult, UserSearchResult } from "@/types/search";
import type { SubscribedRss } from "@/types/subscription";

export const mockFeedList: FeedList = {
  id: 1,
  createdAt: "2026-06-20T09:00:00.000Z",
  title: "Storybook으로 컴포넌트 문서화하기",
  viewCount: 1234,
  path: "https://example.com/post/1",
  thumbnail: "https://picsum.photos/seed/denamu/400/240",
  tag: ["React", "Storybook", "TypeScript"],
  likes: 42,
  comments: 7,
  blog: { name: "데나무", platform: "tistory" },
  isNew: true,
};

export const mockFeedDetail: FeedDetail = {
  ...mockFeedList,
  summary: "이 글은 Storybook을 활용해 프론트엔드 컴포넌트를 문서화하고 테스트하는 방법을 다룹니다.",
  isOwner: false,
  blog: {
    id: 1,
    name: "데나무",
    ownerName: "조민석",
    isOwnerCertified: true,
    platform: "tistory",
    image: null,
  },
  isSubscribed: false,
  isBlocked: false,
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
  subscriberCount: 12,
  isSubscribed: false,
  blogImage: null,
};

export const mockSubscribedRss: SubscribedRss[] = [
  {
    id: 1,
    name: "데나무 블로그",
    userName: "조민석",
    rssUrl: "https://denamu.dev/rss",
    blogPlatform: "tistory",
    feedCount: 42,
    blogImage: null,
  },
  {
    id: 2,
    name: "벨로그 기술 블로그",
    userName: "김개발",
    rssUrl: "https://velog.io/@dev/rss",
    blogPlatform: "velog",
    feedCount: 18,
    blogImage: null,
  },
];

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
  blog: { name: "데나무 블로그", platform: "tistory" },
  path: "https://example.com/post/1",
  createdAt: "2026-06-20T09:00:00.000Z",
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

export const mockRssSearchResult: RssSearchResult = {
  id: 1,
  name: "seok3765.log",
  blogPlatform: "velog",
  blogImage: "https://picsum.photos/seed/rsearch/80/80",
};

export const mockAdminRssList: AdminRssData[] = [
  {
    id: 1,
    name: "데나무 블로그",
    userName: "조민석",
    email: "denamu@example.com",
    rssUrl: "https://denamu.dev/rss",
    description: "기술 블로그",
    blogPlatform: "tistory",
    blogImage: null,
  },
  {
    id: 2,
    name: "벨로그 블로그",
    userName: "홍길동",
    email: "hong@example.com",
    rssUrl: "https://velog.io/@hong/rss",
    blogPlatform: "velog",
    blogImage: null,
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
  days: [makeDay(1, 0), makeDay(2, 2), makeDay(3, 5), makeDay(4, 1), makeDay(5, 8), makeDay(6, 3), makeDay(7, 0)],
};

export const mockDayInfo: DayInfo = makeDay(5, 8);

export const mockWeeks: WeekInfo[] = [
  mockWeekInfo,
  { weekNumber: 2, days: Array.from({ length: 7 }, (_, i) => makeDay(8 + i, i)) },
];

export const mockSidebarIcon = FileText;

export const mockDailyActivities = mockUser.dailyActivities;

export const mockUserProfile: UserProfile = {
  userName: "조민석",
  profileImage: "https://picsum.photos/seed/profile/120/120",
  introduction: "기술 블로그를 운영하는 개발자입니다.",
  maxStreak: 30,
  currentStreak: 7,
  totalViews: 98765,
  isBlocked: false,
};

export const mockBlockedUsers: BlockedUser[] = [
  {
    user: {
      id: 2,
      userName: "차단된개발자",
      profileImage: "https://picsum.photos/seed/blocked1/80/80",
    },
    blockedAt: "2026-06-20T09:00:00.000Z",
  },
  {
    user: {
      id: 3,
      userName: "스팸유저",
      profileImage: null,
    },
    blockedAt: "2026-06-21T12:30:00.000Z",
  },
];

export const mockBlockedRss: BlockedRss[] = [
  {
    rss: {
      id: 5,
      name: "차단된블로그",
      blogPlatform: "velog",
      blogImage: null,
    },
    blockedAt: "2026-06-22T09:00:00.000Z",
  },
];

export const mockProfileActivity: ProfileActivity = {
  dailyActivities: [
    { date: "2026-06-20", viewCount: 12 },
    { date: "2026-06-21", viewCount: 30 },
    { date: "2026-06-22", viewCount: 8 },
    { date: "2026-06-23", viewCount: 5 },
    { date: "2026-06-24", viewCount: 20 },
    { date: "2026-06-25", viewCount: 15 },
    { date: "2026-06-26", viewCount: 3 },
  ],
};

export const mockActivityYears: number[] = [2026, 2025, 2024];

export const mockLikedItemsPage: CursorPage<LikedItem> = {
  result: [
    {
      id: 1,
      likeDate: "2026-06-25T09:00:00.000Z",
      feed: { id: 1, title: "Storybook으로 컴포넌트 문서화하기", path: "https://example.com/post/1" },
    },
    {
      id: 2,
      likeDate: "2026-06-24T09:00:00.000Z",
      feed: { id: 2, title: "TypeScript 5.0 새로운 기능 살펴보기", path: "https://example.com/post/2" },
    },
    {
      id: 3,
      likeDate: "2026-06-23T09:00:00.000Z",
      feed: { id: 3, title: "React Query v5 마이그레이션 가이드", path: "https://example.com/post/3" },
    },
  ],
  lastId: 3,
  hasMore: false,
};

export const mockCommentItemsPage: CursorPage<CommentItem> = {
  result: [
    {
      id: 1,
      comment: "좋은 글 감사합니다!",
      date: "2026-06-25T09:00:00.000Z",
      feed: { id: 1, title: "Storybook으로 컴포넌트 문서화하기", path: "https://example.com/post/1" },
    },
    {
      id: 2,
      comment: "정말 유익한 내용이네요. 특히 마이그레이션 가이드 부분이 도움이 많이 됐습니다.",
      date: "2026-06-24T09:00:00.000Z",
      feed: { id: 2, title: "TypeScript 5.0 새로운 기능 살펴보기", path: "https://example.com/post/2" },
    },
  ],
  lastId: 2,
  hasMore: false,
};

export const mockReportsPage: CursorPage<ReportItem> = {
  result: [
    {
      id: 3,
      targetType: "COMMENT",
      targetId: 12,
      targetLabel: "스팸성 광고 댓글입니다.",
      reason: "SPAM",
      detail: "같은 내용을 여러 게시글에 반복해서 남기고 있습니다.",
      status: "PENDING",
      reporter: { id: 1, userName: "제보자1" },
      createdAt: "2026-06-25T09:00:00.000Z",
      reviewedAt: null,
    },
    {
      id: 2,
      targetType: "RSS",
      targetId: 5,
      targetLabel: "차단된블로그",
      reason: "COPYRIGHT",
      detail: null,
      status: "ACTIONED",
      reporter: { id: 2, userName: "제보자2" },
      createdAt: "2026-06-24T12:00:00.000Z",
      reviewedAt: "2026-06-24T18:00:00.000Z",
    },
    {
      id: 1,
      targetType: "USER",
      targetId: 7,
      targetLabel: "스팸유저",
      reason: "ABUSE",
      detail: "댓글마다 욕설을 남깁니다.",
      status: "REJECTED",
      reporter: { id: 3, userName: "제보자3" },
      createdAt: "2026-06-23T09:00:00.000Z",
      reviewedAt: "2026-06-23T10:00:00.000Z",
    },
  ],
  lastId: 1,
  hasMore: false,
};

export const mockAdminChatRooms: AdminChatRoom[] = [
  { roomId: "room-1", roomName: "일반 채팅", messageCount: 15, userCount: 3 },
  { roomId: "room-2", roomName: "기술 채팅", messageCount: 8, userCount: 1 },
  { roomId: "room-3", roomName: "공지사항", messageCount: 2, userCount: 5 },
];

export const mockAdminChatMessages: ChatType[] = [
  {
    userName: "사용자1",
    timestamp: "2026-06-25T09:00:00.000Z",
    message: "안녕하세요!",
    userId: "user-1",
    messageId: "msg-1",
  },
  {
    userName: "사용자2",
    timestamp: "2026-06-25T09:01:00.000Z",
    message: "반갑습니다. Storybook 설정 완료했나요?",
    userId: "user-2",
    messageId: "msg-2",
  },
  {
    userName: "사용자1",
    timestamp: "2026-06-25T09:02:00.000Z",
    message: "네, 방금 완료했습니다!",
    userId: "user-1",
    messageId: "msg-3",
  },
];

export const mockChildAdmins: ChildAdmin[] = [
  { id: 1, email: "child1@denamu.dev", name: "부관리자1" },
  { id: 2, email: "child2@denamu.dev", name: "부관리자2" },
];

export const mockAdminProfileData = {
  email: "admin@denamu.dev",
  name: "메인 관리자",
  emailNotification: true,
  parent: null as { email: string; name: string } | null,
};

export const mockChartTodayData: ChartType[] = [
  { id: 1, title: "Storybook으로 컴포넌트 문서화하기", viewCount: 1234 },
  { id: 2, title: "TypeScript 5.0 새로운 기능 살펴보기", viewCount: 987 },
  { id: 3, title: "React Query v5 마이그레이션 가이드", viewCount: 856 },
  { id: 4, title: "NestJS 모듈 설계 패턴", viewCount: 645 },
  { id: 5, title: "Docker Compose로 로컬 개발환경 구성", viewCount: 532 },
];

export const mockChartAllData: ChartType[] = [
  { id: 10, title: "프론트엔드 아키텍처 설계", viewCount: 98765 },
  { id: 11, title: "TypeScript 제네릭 완전 정복", viewCount: 87654 },
  { id: 12, title: "React 성능 최적화 가이드", viewCount: 76543 },
  { id: 13, title: "Node.js 스트림 처리", viewCount: 65432 },
  { id: 14, title: "PostgreSQL 인덱스 전략", viewCount: 54321 },
];

export const mockFeedsList: FeedList[] = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
  title: `블로그 포스트 #${i + 1} - Storybook 데모`,
  viewCount: (i + 1) * 100,
  path: `https://example.com/post/${i + 1}`,
  thumbnail: `https://picsum.photos/seed/feed${i}/400/240`,
  tag: i % 2 === 0 ? ["React", "TypeScript"] : ["NestJS", "Node.js"],
  likes: (i + 1) * 5,
  comments: i + 1,
  blog: {
    name: `작성자 ${(i % 4) + 1}`,
    platform: i % 3 === 0 ? "tistory" : i % 3 === 1 ? "velog" : "medium",
  },
  isNew: i < 2,
}));

export const mockNoSummaryFeeds = mockFeedsList.slice(0, 3).map(({ id, title, likes, comments }) => ({
  id,
  title,
  likes,
  comments,
}));

const RECENT_RSS_PLATFORMS = ["velog", "tistory", "medium", "github", "etc"];

export const makeRecentRssList = (count: number, publishedHoursAgo: (index: number) => number): RecentRss[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `블로그 ${i + 1}.log`,
    blogPlatform: RECENT_RSS_PLATFORMS[i % RECENT_RSS_PLATFORMS.length],
    lastPublishedAt: new Date(Date.now() - publishedHoursAgo(i) * 3600000).toISOString(),
    latestFeedId: (i + 1) * 100,
    blogImage: null,
  }));

const mockBoardSummaries: BoardSummary[] = [
  {
    id: 3,
    title: "서비스 정기 점검 안내",
    isPinned: true,
    status: "PUBLISHED",
    category: "NOTICE",
    startAt: null,
    endAt: null,
    createdAt: "2026-07-20T09:00:00.000Z",
  },
  {
    id: 2,
    title: "여름 이벤트 안내",
    isPinned: false,
    status: "PUBLISHED",
    category: "NOTICE",
    startAt: "2026-07-01T00:00:00.000Z",
    endAt: "2026-07-31T00:00:00.000Z",
    createdAt: "2026-06-25T09:00:00.000Z",
  },
  {
    id: 1,
    title: "다음 업데이트 예고 (작성 중)",
    isPinned: false,
    status: "DRAFT",
    category: "NOTICE",
    startAt: null,
    endAt: null,
    createdAt: "2026-06-20T09:00:00.000Z",
  },
];

export const mockBoardsPage: BoardPage<BoardSummary> = {
  result: mockBoardSummaries,
  page: 1,
  limit: 10,
  totalCount: mockBoardSummaries.length,
  hasMore: false,
};

export const mockBoardDetail: BoardDetail = {
  ...mockBoardSummaries[0],
  content: "<p>정기 점검으로 인해 서비스 이용이 일시 중단됩니다.</p>",
  authorName: "테스트 계정",
  updatedAt: "2026-07-20T09:00:00.000Z",
};

const mockQnaSummaries: QnaSummary[] = [
  {
    id: 3,
    title: "구독한 블로그 글이 늦게 반영돼요",
    isSecret: false,
    status: "ANSWERED",
    authorLabel: "홍길동",
    createdAt: "2026-07-20T09:00:00.000Z",
  },
  {
    id: 2,
    title: "비공개 문의입니다",
    isSecret: true,
    status: "PENDING",
    authorLabel: "익명",
    createdAt: "2026-07-19T09:00:00.000Z",
  },
  {
    id: 1,
    title: "RSS 등록은 어떻게 하나요?",
    isSecret: false,
    status: "PENDING",
    authorLabel: "김개발",
    createdAt: "2026-07-18T09:00:00.000Z",
  },
];

export const mockQnaPage: QnaPage<QnaSummary> = {
  result: mockQnaSummaries,
  page: 1,
  limit: 10,
  totalCount: mockQnaSummaries.length,
  hasMore: false,
};

export const mockQnaThread: QnaThread = {
  id: mockQnaSummaries[0].id,
  title: mockQnaSummaries[0].title,
  isSecret: false,
  status: "ANSWERED",
  authorLabel: "홍길동",
  createdAt: "2026-07-20T09:00:00.000Z",
  messages: [
    {
      type: "QUESTION",
      content: "구독한 블로그의 새 글이 목록에 늦게 반영되는 것 같습니다. 확인 부탁드립니다.",
      adminName: null,
      createdAt: "2026-07-20T09:00:00.000Z",
    },
    {
      type: "ANSWER",
      content: "크롤링 주기는 최대 10분입니다. 이후에도 반영이 안 되면 RSS 주소를 다시 확인해 주세요.",
      adminName: "운영팀",
      createdAt: "2026-07-20T10:00:00.000Z",
    },
  ],
};
