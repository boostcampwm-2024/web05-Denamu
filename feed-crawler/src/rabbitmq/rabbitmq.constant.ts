export const RMQ_EXCHANGES = {
  CRAWLING: 'CrawlingExchange',
  DEAD_LETTER: 'DeadLetterExchange',
} as const;

export const RMQ_QUEUES = {
  CRAWLING_FULL: 'crawling.full.queue',
  CRAWLING_FULL_WAIT_5S: 'crawling.full.wait.5s',
  CRAWLING_FULL_WAIT_10S: 'crawling.full.wait.10s',
  CRAWLING_FULL_WAIT_20S: 'crawling.full.wait.20s',
  CRAWLING_FULL_DEAD_LETTER: 'crawling.full.deadLetter.queue',
  CRAWLING_AI_RETRY: 'crawling.aiRetry.queue',
  CRAWLING_AI_RETRY_WAIT_5S: 'crawling.aiRetry.wait.5s',
  CRAWLING_AI_RETRY_WAIT_10S: 'crawling.aiRetry.wait.10s',
  CRAWLING_AI_RETRY_WAIT_20S: 'crawling.aiRetry.wait.20s',
  CRAWLING_AI_RETRY_DEAD_LETTER: 'crawling.aiRetry.deadLetter.queue',
} as const;

export const RMQ_ROUTING_KEYS = {
  CRAWLING_FULL: 'crawling.full',
  CRAWLING_FULL_DEAD_LETTER: 'crawling.full.deadLetter',
  CRAWLING_AI_RETRY: 'crawling.aiRetry',
  CRAWLING_AI_RETRY_DEAD_LETTER: 'crawling.aiRetry.deadLetter',
} as const;

export const RETRY_CONFIG = {
  MAX_RETRY: 3,
  FULL_CRAWL_WAITING_QUEUE: [
    RMQ_QUEUES.CRAWLING_FULL_WAIT_5S,
    RMQ_QUEUES.CRAWLING_FULL_WAIT_10S,
    RMQ_QUEUES.CRAWLING_FULL_WAIT_20S,
  ],
  AI_RETRY_WAITING_QUEUE: [
    RMQ_QUEUES.CRAWLING_AI_RETRY_WAIT_5S,
    RMQ_QUEUES.CRAWLING_AI_RETRY_WAIT_10S,
    RMQ_QUEUES.CRAWLING_AI_RETRY_WAIT_20S,
  ],
} as const;
