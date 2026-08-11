export const RMQ_EXCHANGES = {
  EMAIL: 'EmailExchange',
  CRAWLING: 'CrawlingExchange',
  DEAD_LETTER: 'DeadLetterExchange',
};

export const RMQ_QUEUES = {
  EMAIL_SEND: 'email.send.queue',
  CRAWLING_FULL: 'crawling.full.queue',
  CRAWLING_AI_RETRY: 'crawling.aiRetry.queue',
  EMAIL_DEAD_LETTER: 'email.deadLetter.queue',
  CRAWLING_FULL_DEAD_LETTER: 'crawling.full.deadLetter.queue',
  CRAWLING_AI_RETRY_DEAD_LETTER: 'crawling.aiRetry.deadLetter.queue',
  CRAWLING_NEW_POST: 'crawling.newPost.queue',
  CRAWLING_NEW_POST_DEAD_LETTER: 'crawling.newPost.deadLetter.queue',
};

export const RMQ_ROUTING_KEYS = {
  EMAIL_SEND: 'email.send',
  CRAWLING_FULL: 'crawling.full',
  CRAWLING_AI_RETRY: 'crawling.aiRetry',
  EMAIL_DEAD_LETTER: 'email.deadLetter',
  CRAWLING_FULL_DEAD_LETTER: 'crawling.full.deadLetter',
  CRAWLING_AI_RETRY_DEAD_LETTER: 'crawling.aiRetry.deadLetter',
  CRAWLING_NEW_POST: 'crawling.newPost',
  CRAWLING_NEW_POST_DEAD_LETTER: 'crawling.newPost.deadLetter',
};

export const RMQ_EXCHANGE_TYPE = {
  DIRECT: 'direct',
  TOPIC: 'topic',
  FANOUT: 'fanout',
};
