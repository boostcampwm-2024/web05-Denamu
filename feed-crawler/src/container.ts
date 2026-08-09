import { container } from 'tsyringe';

import { RabbitMQManager } from '@rabbitmq/rabbitmq.manager';
import { RabbitMQService } from '@rabbitmq/rabbitmq.service';

import { DatabaseConnection } from '@common/database/database-connection';
import { MySQLConnection } from '@common/database/mysql-access';
import { DEPENDENCY_SYMBOLS } from '@common/dependency-symbols';
import { AiMetrics } from '@common/metrics/ai-metrics';
import { DbMetrics } from '@common/metrics/db-metrics';
import { FeedMetrics } from '@common/metrics/feed-metrics';
import { RedisMetrics } from '@common/metrics/redis-metrics';
import { DiscordNotifier } from '@common/notification/discord.notifier';
import { NotifierRegistry } from '@common/notification/notifier-registry';
import { Notifier } from '@common/notification/notifier.interface';
import { FeedParserManager } from '@common/parser/feed-parser-manager';
import { Atom10Parser } from '@common/parser/formats/atom10-parser';
import { Rss20Parser } from '@common/parser/formats/rss20-parser';
import { ParserUtil } from '@common/parser/utils/parser-util';
import { RedisConnection } from '@common/redis/redis-access';

import { AiSummaryRetryEventWorker } from '@event_worker/workers/ai-summary-retry-event-worker';
import { ClaudeEventWorker } from '@event_worker/workers/claude-event-worker';
import { FullFeedCrawlEventWorker } from '@event_worker/workers/full-feed-crawl-event-worker';

import { FeedRepository } from '@repository/feed.repository';
import { RssRepository } from '@repository/rss.repository';
import { TagMapRepository } from '@repository/tag-map.repository';
import { TagRepository } from '@repository/tag.repository';

import { FeedCrawler } from './feed-crawler';

container.registerSingleton<DatabaseConnection>(
  DEPENDENCY_SYMBOLS.DatabaseConnection,
  MySQLConnection,
);
container.registerSingleton(FeedMetrics);
container.registerSingleton(AiMetrics);
container.registerSingleton(DbMetrics);
container.registerSingleton(RedisMetrics);
container.registerSingleton(RedisConnection);
container.registerSingleton(RabbitMQManager);
container.registerSingleton(RabbitMQService);
container.registerSingleton(RssRepository);
container.registerSingleton(FeedRepository);
container.registerSingleton(TagRepository);
container.registerSingleton(TagMapRepository);
container.registerSingleton(ClaudeEventWorker);
container.registerSingleton(ParserUtil);
container.registerSingleton(Rss20Parser);
container.registerSingleton(Atom10Parser);
container.registerSingleton(FeedParserManager);
container.registerSingleton(FeedCrawler);
container.registerSingleton(FullFeedCrawlEventWorker);
container.registerSingleton(AiSummaryRetryEventWorker);

container.registerSingleton(DiscordNotifier);
container.registerSingleton(NotifierRegistry);

const registry = container.resolve(NotifierRegistry);
registry.register('discord', container.resolve(DiscordNotifier));

container.registerInstance<Notifier>(DEPENDENCY_SYMBOLS.Notifier, registry);

export { container };
