import { LucideIcon } from "lucide-react";

export interface DailyActivity {
  date: string;
  viewCount: number;
}

export interface User {
  name: string;
  email: string;
  avatar: string;
  bio: string;
  blogUrl: string;
  rssRegistered: boolean;
  lastPosted: string;
  totalPosts: number;
  totalViews: number;
  topics: string[];
  dailyActivities: DailyActivity[];
  streakCount: number;
  longestStreak: number;
}

export interface SidebarItem {
  icon: LucideIcon;
  label: string;
  id: string;
}

export type ProfileTab = "mypage" | "rss" | "blocks" | "settings";

export interface UserProfile {
  userName: string;
  profileImage: string | null;
  introduction: string | null;
  maxStreak: number;
  currentStreak: number;
  totalViews: number;
  isBlocked: boolean;
  marketingEmailAgreed?: boolean;
  inactivityEmailAgreed?: boolean;
  noticeEmailAgreed?: boolean;
}

export interface BlockedUser {
  user: {
    id: number;
    userName: string;
    profileImage: string | null;
  };
  blockedAt: string;
}

export interface BlockedRss {
  rss: {
    id: number;
    name: string;
    blogPlatform: string;
    blogImage: string | null;
  };
  blockedAt: string;
}

export interface ProfileActivity {
  dailyActivities: DailyActivity[];
}

export interface UpdateProfilePayload {
  userName?: string;
  introduction?: string;
  marketingEmailAgreed?: boolean;
  inactivityEmailAgreed?: boolean;
  noticeEmailAgreed?: boolean;
}

export interface ChangePasswordPayload {
  currentPassword?: string;
  newPassword: string;
}

export interface UploadResult {
  id: number;
  url: string;
}

export interface CertifiedRss {
  id: number;
  name: string;
  userName: string;
  rssUrl: string;
  blogUrl: string;
  blogPlatform: string;
  feedCount: number;
  subscriberCount: number;
  isSubscribed: boolean;
  blogImage: string | null;
  suspensionCount: number;
}

export interface RssCertificationPreview {
  name: string;
  userName: string;
  rssUrl: string;
  blogPlatform: string;
  requiresEmailVerification: boolean;
}

export interface CreateRssCertificationResult {
  blogPlatform: string;
  userName: string;
  certified: boolean;
}

export interface FeedRef {
  id: number;
  title: string;
  path: string;
}

export interface LikedItem {
  id: number;
  likeDate: string;
  feed: FeedRef;
}

export interface CommentItem {
  id: number;
  comment: string;
  date: string;
  feed: FeedRef;
}

export interface RssFeedItem {
  id: number;
  title: string;
  path: string;
  thumbnail: string;
  createdAt: string;
  commentCount: number;
  likeCount: number;
}

export interface RssOwner {
  id: number;
  userName: string;
  profileImage: string | null;
}

export interface RssInfo {
  id: number;
  name: string;
  userName: string;
  rssUrl: string;
  blogUrl: string;
  blogPlatform: string;
  feedCount: number;
  subscriberCount: number;
  isSubscribed: boolean;
  isOwner: boolean;
  lastPublishedAt: string | null;
  owner: RssOwner | null;
  isBlocked: boolean;
  blogImage: string | null;
}

export interface OwnedRssFeedItem extends RssFeedItem {
  isPublic: boolean;
}

export interface CursorPage<T> {
  result: T[];
  lastId: number;
  hasMore: boolean;
}

export type OAuthProviderType = "google" | "github";

export interface LinkedProvider {
  provider: OAuthProviderType;
  providerUserName: string | null;
  linkedAt: string;
}

export interface LinkedProvidersResponse {
  hasPassword: boolean;
  providers: LinkedProvider[];
}
