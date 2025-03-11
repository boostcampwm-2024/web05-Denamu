import { container } from 'tsyringe';
import { DatabaseConnection } from './types/database-connection';
import { DEPENDENCY_SYMBOLS } from './types/dependency-symbols';
import { MySQLConnection } from './common/mysql-access';
import { RssRepository } from './repository/rss.repository';
import { FeedRepository } from './repository/feed.repository';
import { RedisConnection } from './common/redis-access';
import { TagMapRepository } from './repository/tag-map.repository';
import { RssParser } from './common/rss-parser';
import { ClaudeService } from './claude.service';

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

container.registerSingleton<ClaudeService>(
  DEPENDENCY_SYMBOLS.ClaudeService,
  ClaudeService,
);

container.registerSingleton<RssParser>(DEPENDENCY_SYMBOLS.RssParser, RssParser);

export { container };
