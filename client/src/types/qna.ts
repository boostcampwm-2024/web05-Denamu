export type QnaStatus = "PENDING" | "ANSWERED";
export type QnaMessageType = "QUESTION" | "ANSWER";

export interface QnaSummary {
  id: number;
  title: string;
  isSecret: boolean;
  status: QnaStatus;
  authorLabel: string;
  createdAt: string;
}

export interface QnaMessage {
  type: QnaMessageType;
  content: string;
  adminName: string | null;
  createdAt: string;
}

export interface QnaLocked {
  id: number;
  title: string;
  isSecret: true;
  requiresPassword: true;
}

export interface QnaThread {
  id: number;
  title: string;
  isSecret: boolean;
  status: QnaStatus;
  authorLabel: string;
  createdAt: string;
  requiresPassword?: false;
  messages: QnaMessage[];
}

export type QnaDetail = QnaLocked | QnaThread;

export interface QnaPage<T> {
  result: T[];
  page: number;
  limit: number;
  totalCount: number;
  hasMore: boolean;
}

export interface CreateQnaPayload {
  title: string;
  content: string;
  isSecret: boolean;
  password?: string;
  guestName?: string;
  guestEmail?: string;
}

export interface VerifyQnaPasswordPayload {
  password: string;
}

export interface AddQnaMessagePayload {
  content: string;
  password?: string;
}

export interface AnswerQnaPayload {
  content: string;
}
