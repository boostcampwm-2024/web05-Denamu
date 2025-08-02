import 'reflect-metadata';
import { DatabaseConnection } from '../../src/types/database-connection';
import { DEPENDENCY_SYMBOLS } from '../../src/types/dependency-symbols';
import { MySQLConnection } from '../../src/common/mysql-access';
import { RedisConnection } from '../../src/common/redis-access';
import { RssRepository } from '../../src/repository/rss.repository';
import { FeedRepository } from '../../src/repository/feed.repository';
import { container } from 'tsyringe';
import { DependencyContainer } from 'tsyringe';
import { ParserUtil } from '../../src/common/parser/utils/parser-util';
import { ClaudeService } from '../../src/claude.service';
import { TagMapRepository } from '../../src/repository/tag-map.repository';
import { FeedParserManager } from '../../src/common/parser/feed-parser-manager';
import { Rss20Parser } from '../../src/common/parser/formats/rss20-parser';
import { Atom10Parser } from '../../src/common/parser/formats/atom10-parser';
import { FeedCrawler } from '../../src/feed-crawler';

export interface TestContext {
  container: DependencyContainer;
  rssRepository: RssRepository;
  feedRepository: FeedRepository;
  dbConnection: DatabaseConnection;
  redisConnection: RedisConnection;
  claudeService: ClaudeService;
  tagMapRepository: TagMapRepository;
  parserUtil: ParserUtil;
  feedParserManager: FeedParserManager;
  rss20Parser: Rss20Parser;
  atom10Parser: Atom10Parser;
  feedCrawler: FeedCrawler;
}

declare global {
  var testContext: TestContext;
}

export function setupTestContainer(): TestContext {
  if (!global.testContext) {
    const testContainer = container.createChildContainer();

    testContainer.registerSingleton<DatabaseConnection>(
      DEPENDENCY_SYMBOLS.DatabaseConnection,
      MySQLConnection,
    );

    testContainer.registerSingleton<RedisConnection>(
      DEPENDENCY_SYMBOLS.RedisConnection,
      RedisConnection,
    );

    testContainer.registerSingleton<RssRepository>(
      DEPENDENCY_SYMBOLS.RssRepository,
      RssRepository,
    );

    testContainer.registerSingleton<FeedRepository>(
      DEPENDENCY_SYMBOLS.FeedRepository,
      FeedRepository,
    );

    testContainer.registerSingleton<ClaudeService>(
      DEPENDENCY_SYMBOLS.ClaudeService,
      ClaudeService,
    );

    testContainer.registerSingleton<TagMapRepository>(
      DEPENDENCY_SYMBOLS.TagMapRepository,
      TagMapRepository,
    );

    testContainer.registerSingleton<ParserUtil>(
      DEPENDENCY_SYMBOLS.ParserUtil,
      ParserUtil,
    );

    testContainer.registerSingleton<Rss20Parser>(
      DEPENDENCY_SYMBOLS.Rss20Parser,
      Rss20Parser,
    );

    testContainer.registerSingleton<Atom10Parser>(
      DEPENDENCY_SYMBOLS.Atom10Parser,
      Atom10Parser,
    );

    testContainer.registerSingleton<FeedParserManager>(
      DEPENDENCY_SYMBOLS.FeedParserManager,
      FeedParserManager,
    );

    testContainer.registerSingleton<FeedCrawler>(
      DEPENDENCY_SYMBOLS.FeedCrawler,
      FeedCrawler,
    );

    global.testContext = {
      container: testContainer,
      tagMapRepository: testContainer.resolve<TagMapRepository>(
        DEPENDENCY_SYMBOLS.TagMapRepository,
      ),
      claudeService: testContainer.resolve<ClaudeService>(
        DEPENDENCY_SYMBOLS.ClaudeService,
      ),
      rssRepository: testContainer.resolve<RssRepository>(
        DEPENDENCY_SYMBOLS.RssRepository,
      ),
      feedRepository: testContainer.resolve<FeedRepository>(
        DEPENDENCY_SYMBOLS.FeedRepository,
      ),
      dbConnection: testContainer.resolve<DatabaseConnection>(
        DEPENDENCY_SYMBOLS.DatabaseConnection,
      ),
      redisConnection: testContainer.resolve<RedisConnection>(
        DEPENDENCY_SYMBOLS.RedisConnection,
      ),
      parserUtil: testContainer.resolve<ParserUtil>(
        DEPENDENCY_SYMBOLS.ParserUtil,
      ),
      feedParserManager: testContainer.resolve<FeedParserManager>(
        DEPENDENCY_SYMBOLS.FeedParserManager,
      ),
      rss20Parser: testContainer.resolve<Rss20Parser>(
        DEPENDENCY_SYMBOLS.Rss20Parser,
      ),
      atom10Parser: testContainer.resolve<Atom10Parser>(
        DEPENDENCY_SYMBOLS.Atom10Parser,
      ),
      feedCrawler: testContainer.resolve<FeedCrawler>(
        DEPENDENCY_SYMBOLS.FeedCrawler,
      ),
    };
  }

  return global.testContext;
}
