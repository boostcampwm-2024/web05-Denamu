export const RMQ_EXCHANGES = {
  EMAIL: 'EmailExchange',
  CRAWLING: 'CrawlingExchange',
  DEAD_LETTER: 'DeadLetterExchange',
};

export const RMQ_QUEUES = {
  EMAIL_SEND: 'email.send.queue',
  CRAWLING_FULL: 'crawling.full.queue',
  EMAIL_DEAD_LETTER: 'email.deadLetter.queue',
  CRAWLING_FULL_DEAD_LETTER: 'crawling.full.deadLetter.queue',
};

export const RMQ_ROUTING_KEYS = {
  EMAIL_SEND: 'email.send',
  CRAWLING_FULL: 'crawling.full',
  EMAIL_DEAD_LETTER: 'email.deadLetter',
  CRAWLING_FULL_DEAD_LETTER: 'crawling.full.deadLetter',
};

export const RMQ_EXCHANGE_TYPE = {
  DIRECT: 'direct',
  TOPIC: 'topic',
  FANOUT: 'fanout',
};
