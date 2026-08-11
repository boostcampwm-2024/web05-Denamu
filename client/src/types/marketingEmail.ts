export interface MarketingEmailSummary {
  id: number;
  subject: string;
  recipientCount: number;
  authorName: string | null;
  createdAt: string;
}

export interface MarketingEmailDetail extends MarketingEmailSummary {
  content: string;
}

export interface MarketingEmailPage<T> {
  result: T[];
  page: number;
  limit: number;
  totalCount: number;
  hasMore: boolean;
}

export interface SendMarketingEmailPayload {
  subject: string;
  content: string;
}
