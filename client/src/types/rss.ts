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
}
export interface AdminRss {
  message: string;
  data: AdminRssData[];
}

export type AdminResponse = {
  message: string;
};
export type AdminRequest = {
  id: number;
  rejectMessage?: string;
};

export interface RegisterRss {
  blog: string; 
  name: string; 
  email: string; 
  rssUrl: string; 
  blogType?: string; 
}

export interface RegisterResponse {
  message: string; 
}
