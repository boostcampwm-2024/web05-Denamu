import { container } from 'tsyringe';

import { FeedCrawler } from '@src/feed-crawler';

import { MySQLConnection } from '@common/mysql-access';
import { FeedParserManager } from '@common/parser/feed-parser-manager';
import { Atom10Parser } from '@common/parser/formats/atom10-parser';
import { Rss20Parser } from '@common/parser/formats/rss20-parser';
import { ParserUtil } from '@common/parser/utils/parser-util';
import { RabbitMQManager } from '@common/rabbitmq.manager';
import { RedisConnection } from '@common/redis-access';
import { RabbitMQConnection } from '@common/rmq-access';

import { ClaudeEventWorker } from '@event_worker/workers/claude-event-worker';
import { FullFeedCrawlEventWorker } from '@event_worker/workers/full-feed-crawl-event-worker';

import { FeedRepository } from '@repository/feed.repository';
import { RssRepository } from '@repository/rss.repository';
import { TagMapRepository } from '@repository/tag-map.repository';

import { DatabaseConnection } from '@app-types/database-connection';
import { DEPENDENCY_SYMBOLS } from '@app-types/dependency-symbols';

container.registerSingleton<DatabaseConnection>(
  DEPENDENCY_SYMBOLS.DatabaseConnection,
  MySQLConnection,
);

container.registerSingleton<RedisConnection>(
  DEPENDENCY_SYMBOLS.RedisConnection,
  RedisConnection,
);

container.registerSingleton<RssRepository>(
  DEPENDENCY_SYMBOLS.RssRepository,
  RssRepository,
);

container.registerSingleton<FeedRepository>(
  DEPENDENCY_SYMBOLS.FeedRepository,
  FeedRepository,
);

container.registerSingleton<TagMapRepository>(
  DEPENDENCY_SYMBOLS.TagMapRepository,
  TagMapRepository,
);

container.registerSingleton<ClaudeEventWorker>(
  DEPENDENCY_SYMBOLS.ClaudeEventWorker,
  ClaudeEventWorker,
);

container.registerSingleton<ParserUtil>(
  DEPENDENCY_SYMBOLS.ParserUtil,
  ParserUtil,
);

container.registerSingleton<Rss20Parser>(
  DEPENDENCY_SYMBOLS.Rss20Parser,
  Rss20Parser,
);

container.registerSingleton<Atom10Parser>(
  DEPENDENCY_SYMBOLS.Atom10Parser,
  Atom10Parser,
);

container.registerSingleton<FeedParserManager>(
  DEPENDENCY_SYMBOLS.FeedParserManager,
  FeedParserManager,
);

container.registerSingleton<FeedCrawler>(
  DEPENDENCY_SYMBOLS.FeedCrawler,
  FeedCrawler,
);

container.registerSingleton<FullFeedCrawlEventWorker>(
  DEPENDENCY_SYMBOLS.FullFeedCrawlEventWorker,
  FullFeedCrawlEventWorker,
);

container.registerSingleton<RabbitMQConnection>(
  DEPENDENCY_SYMBOLS.RabbitMQConnection,
  RabbitMQConnection,
);

container.registerSingleton<RabbitMQManager>(
  DEPENDENCY_SYMBOLS.RabbitMQManager,
  RabbitMQManager,
);

export { container };
