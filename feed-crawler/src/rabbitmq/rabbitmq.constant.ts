export const RMQ_EXCHANGES = {
  CRAWLING: 'CrawlingExchange',
  DEAD_LETTER: 'DeadLetterExchange',
} as const;

export const RMQ_QUEUES = {
  CRAWLING_FULL: 'crawling.full.queue',
  CRAWLING_FULL_DEAD_LETTER: 'crawling.full.deadLetter.queue',
  CRAWLING_AI_RETRY: 'crawling.aiRetry.queue',
  CRAWLING_AI_RETRY_DEAD_LETTER: 'crawling.aiRetry.deadLetter.queue',
  CRAWLING_NEW_POST: 'crawling.newPost.queue',
  CRAWLING_NEW_POST_DEAD_LETTER: 'crawling.newPost.deadLetter.queue',
} as const;

export const RMQ_ROUTING_KEYS = {
  CRAWLING_FULL: 'crawling.full',
  CRAWLING_FULL_DEAD_LETTER: 'crawling.full.deadLetter',
  CRAWLING_AI_RETRY: 'crawling.aiRetry',
  CRAWLING_AI_RETRY_DEAD_LETTER: 'crawling.aiRetry.deadLetter',
  CRAWLING_NEW_POST: 'crawling.newPost',
  CRAWLING_NEW_POST_DEAD_LETTER: 'crawling.newPost.deadLetter',
} as const;
