export type NoticeStatus = "DRAFT" | "PUBLISHED";

export interface NoticeSummary {
  id: number;
  title: string;
  isPinned: boolean;
  status: NoticeStatus;
  startAt: string | null;
  endAt: string | null;
  createdAt: string;
}

export interface NoticeDetail extends NoticeSummary {
  content: string;
  authorName: string | null;
  updatedAt: string;
}

export interface NoticePage<T> {
  result: T[];
  page: number;
  limit: number;
  totalCount: number;
  hasMore: boolean;
}

export interface CreateNoticePayload {
  title: string;
  content: string;
  isPinned?: boolean;
  status?: NoticeStatus;
  startAt?: string;
  endAt?: string;
}

export interface UpdateNoticePayload {
  title?: string;
  content?: string;
  isPinned?: boolean;
  status?: NoticeStatus;
  startAt?: string | null;
  endAt?: string | null;
}
