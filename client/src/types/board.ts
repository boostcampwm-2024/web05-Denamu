export type BoardStatus = "DRAFT" | "PUBLISHED";
export type BoardCategory = "NOTICE" | "FAQ";

export interface BoardSummary {
  id: number;
  title: string;
  isPinned: boolean;
  status: BoardStatus;
  category: BoardCategory;
  startAt: string | null;
  endAt: string | null;
  createdAt: string;
}

export interface BoardDetail extends BoardSummary {
  content: string;
  question: string | null;
  authorName: string | null;
  updatedAt: string;
}

export interface BoardPage<T> {
  result: T[];
  page: number;
  limit: number;
  totalCount: number;
  hasMore: boolean;
}

export interface CreateBoardPayload {
  title: string;
  content: string;
  question?: string;
  isPinned?: boolean;
  status?: BoardStatus;
  category?: BoardCategory;
  startAt?: string;
  endAt?: string;
}

export interface UpdateBoardPayload {
  title?: string;
  content?: string;
  question?: string;
  isPinned?: boolean;
  status?: BoardStatus;
  category?: BoardCategory;
  startAt?: string | null;
  endAt?: string | null;
}
