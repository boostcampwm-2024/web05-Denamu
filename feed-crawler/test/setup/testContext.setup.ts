import { FeedCrawler } from '@src/feed-crawler';

import { MySQLConnection } from '@common/mysql-access';
import { FeedParserManager } from '@common/parser/feed-parser-manager';
import { Atom10Parser } from '@common/parser/formats/atom10-parser';
import { Rss20Parser } from '@common/parser/formats/rss20-parser';
import { ParserUtil } from '@common/parser/utils/parser-util';
import { RedisConnection } from '@common/redis-access';

import { ClaudeEventWorker } from '@event_worker/workers/claude-event-worker';

import { FeedRepository } from '@repository/feed.repository';
import { RssRepository } from '@repository/rss.repository';
import { TagMapRepository } from '@repository/tag-map.repository';

import { DatabaseConnection } from '@app-types/database-connection';
import { DEPENDENCY_SYMBOLS } from '@app-types/dependency-symbols';

import 'reflect-metadata';
import { container } from 'tsyringe';
import { DependencyContainer } from 'tsyringe';

export interface TestContext {
  container: DependencyContainer;
  rssRepository: RssRepository;
  feedRepository: FeedRepository;
  dbConnection: DatabaseConnection;
  redisConnection: RedisConnection;
  claudeEventWorker: ClaudeEventWorker;
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

    testContainer.registerSingleton<ClaudeEventWorker>(
      DEPENDENCY_SYMBOLS.ClaudeEventWorker,
      ClaudeEventWorker,
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
      claudeEventWorker: testContainer.resolve<ClaudeEventWorker>(
        DEPENDENCY_SYMBOLS.ClaudeEventWorker,
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
