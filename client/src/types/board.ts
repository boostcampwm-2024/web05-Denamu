export type BoardStatus = "DRAFT" | "PUBLISHED";

export interface BoardSummary {
  id: number;
  title: string;
  isPinned: boolean;
  status: BoardStatus;
  startAt: string | null;
  endAt: string | null;
  createdAt: string;
}

export interface BoardDetail extends BoardSummary {
  content: string;
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
  isPinned?: boolean;
  status?: BoardStatus;
  startAt?: string;
  endAt?: string;
}

export interface UpdateBoardPayload {
  title?: string;
  content?: string;
  isPinned?: boolean;
  status?: BoardStatus;
  startAt?: string | null;
  endAt?: string | null;
}
