import { ApiData, ApiMessage } from "@/types/api";

export type RssRequestStatus = "pending" | "approved" | "rejected";

export interface RssRequest {
  id?: number;
  blogName: string; 
  rssUrl: string; 
  realName: string; 
  email: string; 
  requestedAt: string; 
  status: RssRequestStatus; 
  rejectReason?: string; 
  approvedAt?: string;
  rejectedAt?: string;
}

export interface AdminRssData {
  id: number;
  name: string;
  userName: string;
  email: string;
  rssUrl: string;
  description?: string;
  blogImage: string | null;
  blogPlatform: string;
}
export type AdminRss = ApiData<AdminRssData[]>;

export type AdminResponse = ApiMessage;
export type AdminRequest = {
  id: number;
  rejectMessage?: string;
};

export interface RegisterRss {
  blogName: string;
  name: string;
  email: string;
  blogUrl: string;
  blogPlatform: string;
}

export type RegisterResponse = ApiMessage;

export interface RecentRss {
  id: number;
  name: string;
  blogPlatform: string;
  lastPublishedAt: string;
  latestFeedId: number;
  blogImage: string | null;
}
