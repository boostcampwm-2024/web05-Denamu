export const RMQ_EXCHANGES = {
  EMAIL: 'EmailExchange',
  CRAWLING: 'CrawlingExchange',
  DEAD_LETTER: 'DeadLetterExchange',
} as const;

export const RMQ_QUEUES = {
  EMAIL_SEND: 'email.send.queue',
  CRAWLING_FULL: 'crawling.full.queue',
  EMAIL_SEND_WAIT_5S: 'email.send.wait.5s',
  EMAIL_SEND_WAIT_10S: 'email.send.wait.10s',
  EMAIL_SEND_WAIT_20S: 'email.send.wait.20s',
  EMAIL_DEAD_LETTER: 'email.deadLetter.queue',
  CRAWLING_FULL_DEAD_LETTER: 'crawling.full.deadLetter.queue',
} as const;

export const RMQ_ROUTING_KEYS = {
  EMAIL_SEND: 'email.send',
  CRAWLING_FULL: 'crawling.full',
  EMAIL_DEAD_LETTER: 'email.deadLetter',
  CRAWLING_FULL_DEAD_LETTER: 'crawling.full.deadLetter',
} as const;

export const RMQ_EXCHANGE_TYPE = {
  DIRECT: 'direct',
  TOPIC: 'topic',
  FANOUT: 'fanout',
} as const;

export const RETRY_CONFIG = {
  MAX_RETRY: 3,
  WAITING_QUEUE: [
    RMQ_QUEUES.EMAIL_SEND_WAIT_5S,
    RMQ_QUEUES.EMAIL_SEND_WAIT_10S,
    RMQ_QUEUES.EMAIL_SEND_WAIT_20S,
  ],
} as const;
