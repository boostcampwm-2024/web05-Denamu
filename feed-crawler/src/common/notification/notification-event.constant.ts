export const NOTIFICATION_EVENT = {
  FEED_CRAWLING_SCHEDULED: 'feed.crawling.scheduled',
  FEED_CRAWLING_FULL: 'feed.crawling.full',
  AI_SUMMARY: 'ai.summary',
} as const;

export type NotificationEvent =
  (typeof NOTIFICATION_EVENT)[keyof typeof NOTIFICATION_EVENT];

export interface fullFeedCrawlingPayload {
  error: Error;
  blogUrl: string;
  errorSource: string;
}

export interface scheduledFeedCrawlingPayload {
  error: Error;
  blogUrl: string;
  errorSource: string;
}

export interface aiSummaryPayload {
  error: Error;
  feedId: number;
  errorSource: string;
}

export type NotificationEventPayloadMap = {
  [NOTIFICATION_EVENT.FEED_CRAWLING_FULL]: fullFeedCrawlingPayload;
  [NOTIFICATION_EVENT.FEED_CRAWLING_SCHEDULED]: scheduledFeedCrawlingPayload;
  [NOTIFICATION_EVENT.AI_SUMMARY]: aiSummaryPayload;
};
