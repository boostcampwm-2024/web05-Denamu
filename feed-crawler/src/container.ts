import { container } from 'tsyringe';

import { DatabaseConnection } from '@common/database-connection';
import { DEPENDENCY_SYMBOLS } from '@common/dependency-symbols';
import { MySQLConnection } from '@common/mysql-access';
import { DiscordNotifier } from '@common/notification/discord.notifier';
import { Notifier } from '@common/notification/notifier.interface';
import { FeedParserManager } from '@common/parser/feed-parser-manager';
import { Atom10Parser } from '@common/parser/formats/atom10-parser';
import { Rss20Parser } from '@common/parser/formats/rss20-parser';
import { ParserUtil } from '@common/parser/utils/parser-util';
import { RedisConnection } from '@common/redis-access';

import { ClaudeEventWorker } from '@event_worker/workers/claude-event-worker';
import { FullFeedCrawlEventWorker } from '@event_worker/workers/full-feed-crawl-event-worker';

import { FeedRepository } from '@repository/feed.repository';
import { RssRepository } from '@repository/rss.repository';
import { TagMapRepository } from '@repository/tag-map.repository';

import { FeedCrawler } from './feed-crawler';

container.registerSingleton<DatabaseConnection>(
  DEPENDENCY_SYMBOLS.DatabaseConnection,
  MySQLConnection,
);

container.registerSingleton(RedisConnection);

container.registerSingleton(RssRepository);

container.registerSingleton(FeedRepository);

container.registerSingleton(TagMapRepository);

container.registerSingleton(ClaudeEventWorker);

container.registerSingleton(ParserUtil);

container.registerSingleton(Rss20Parser);

container.registerSingleton(Atom10Parser);

container.registerSingleton(FeedParserManager);

container.registerSingleton(FeedCrawler);

container.registerSingleton(FullFeedCrawlEventWorker);

container.registerSingleton<Notifier>(
  DEPENDENCY_SYMBOLS.Notifier,
  DiscordNotifier,
);

export { container };
