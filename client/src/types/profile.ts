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

export type ProfileTab = "mypage" | "rss" | "settings";

export interface UserProfile {
  userName: string;
  profileImage: string | null;
  introduction: string | null;
  maxStreak: number;
  currentStreak: number;
  totalViews: number;
}

export interface ProfileActivity {
  dailyActivities: DailyActivity[];
}

export interface UpdateProfilePayload {
  userName?: string;
  profileImage?: string;
  introduction?: string;
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
  blogPlatform: string;
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

export interface CursorPage<T> {
  result: T[];
  lastId: number;
  hasMore: boolean;
}
