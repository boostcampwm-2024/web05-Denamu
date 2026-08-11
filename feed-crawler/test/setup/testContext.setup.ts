import 'reflect-metadata';

import { container } from 'tsyringe';
import { DependencyContainer } from 'tsyringe';

import { DatabaseConnection } from '@common/database/database-connection';
import { MySQLConnection } from '@common/database/mysql-access';
import { DEPENDENCY_SYMBOLS } from '@common/dependency-symbols';
import { AiMetrics } from '@common/metrics/ai-metrics';
import { DbMetrics } from '@common/metrics/db-metrics';
import { FeedMetrics } from '@common/metrics/feed-metrics';
import { RedisMetrics } from '@common/metrics/redis-metrics';
import { FeedParserManager } from '@common/parser/feed-parser-manager';
import { Atom10Parser } from '@common/parser/formats/atom10-parser';
import { Rss20Parser } from '@common/parser/formats/rss20-parser';
import { ParserUtil } from '@common/parser/utils/parser-util';
import { RedisConnection } from '@common/redis/redis-access';

import { ClaudeEventWorker } from '@event_worker/workers/claude-event-worker';

import { FeedRepository } from '@repository/feed.repository';
import { RssRepository } from '@repository/rss.repository';
import { TagMapRepository } from '@repository/tag-map.repository';

import { FeedCrawler } from '../../src/feed-crawler';

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

    testContainer.registerSingleton(DbMetrics);
    testContainer.registerSingleton(RedisMetrics);
    testContainer.registerSingleton(AiMetrics);
    testContainer.registerSingleton(FeedMetrics);
    testContainer.registerSingleton(RedisConnection);
    testContainer.registerSingleton(RssRepository);
    testContainer.registerSingleton(FeedRepository);
    testContainer.registerSingleton(ClaudeEventWorker);
    testContainer.registerSingleton(TagMapRepository);
    testContainer.registerSingleton(ParserUtil);
    testContainer.registerSingleton(Rss20Parser);
    testContainer.registerSingleton(Atom10Parser);
    testContainer.registerSingleton(FeedParserManager);
    testContainer.registerSingleton(FeedCrawler);

    global.testContext = {
      container: testContainer,
      tagMapRepository: testContainer.resolve(TagMapRepository),
      claudeEventWorker: testContainer.resolve(ClaudeEventWorker),
      rssRepository: testContainer.resolve(RssRepository),
      feedRepository: testContainer.resolve(FeedRepository),
      dbConnection: testContainer.resolve<DatabaseConnection>(
        DEPENDENCY_SYMBOLS.DatabaseConnection,
      ),
      redisConnection: testContainer.resolve(RedisConnection),
      parserUtil: testContainer.resolve(ParserUtil),
      feedParserManager: testContainer.resolve(FeedParserManager),
      rss20Parser: testContainer.resolve(Rss20Parser),
      atom10Parser: testContainer.resolve(Atom10Parser),
      feedCrawler: testContainer.resolve(FeedCrawler),
    };
  }

  return global.testContext;
}
