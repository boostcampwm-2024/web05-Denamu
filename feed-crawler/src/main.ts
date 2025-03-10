import 'reflect-metadata';
import './common/env-load';
import logger from './common/logger';
import { FeedCrawler } from './feed-crawler';
import { container } from './container';
import { RssRepository } from './repository/rss.repository';
import { FeedRepository } from './repository/feed.repository';
import { DEPENDENCY_SYMBOLS } from './types/dependency-symbols';
import { DatabaseConnection } from './types/database-connection';
import { RssParser } from './common/rss-parser';
import { ClaudeService } from './claude.service';
import * as schedule from 'node-schedule';
import { RedisConnection } from './common/redis-access';
import { TagMapRepository } from './repository/tag-map.repository';

function initializeDependencies() {
  return {
    rssRepository: container.resolve<RssRepository>(
      DEPENDENCY_SYMBOLS.RssRepository,
    ),
    feedRepository: container.resolve<FeedRepository>(
      DEPENDENCY_SYMBOLS.FeedRepository,
    ),
    tagMapRepository: container.resolve<TagMapRepository>(
      DEPENDENCY_SYMBOLS.TagMapRepository,
    ),
    dbConnection: container.resolve<DatabaseConnection>(
      DEPENDENCY_SYMBOLS.DatabaseConnection,
    ),
    redisConnection: container.resolve<RedisConnection>(
      DEPENDENCY_SYMBOLS.RedisConnection,
    ),
    rssParser: container.resolve<RssParser>(DEPENDENCY_SYMBOLS.RssParser),
  };
}

function registerSchedulers(
  dependencies: ReturnType<typeof initializeDependencies>,
) {
  schedule.scheduleJob('FEED CRAWLING', '0,30 * * * *', async () => {
    logger.info(`Feed Crawling Start: ${new Date().toISOString()}`);
    const feedCrawler = new FeedCrawler(
      dependencies.rssRepository,
      dependencies.feedRepository,
      dependencies.rssParser,
    );
    feedCrawler.start();
  });

  schedule.scheduleJob(
    'AI API PER MINUTE REQUEST RATE LIMIT',
    '*/1 * * * *',
    () => {
      logger.info(`AI Request Start: ${new Date().toISOString()}`);
      const aiRequest = new ClaudeService(
        dependencies.tagMapRepository,
        dependencies.feedRepository,
        dependencies.redisConnection,
      );
      aiRequest.startRequestAI();
    },
  );
}

async function handleShutdown(
  dependencies: ReturnType<typeof initializeDependencies>,
  signal: string,
) {
  logger.info(`${signal} 신호 수신, feed-crawler 종료 중...`);
  await dependencies.dbConnection.end();
  await dependencies.redisConnection.quit();
  logger.info('DB 및 Redis 연결 종료');
  process.exit(0);
}

function startScheduler() {
  logger.info('[Feed Crawler Scheduler Start]');

  const dependencies = initializeDependencies();
  registerSchedulers(dependencies);

  process.on('SIGINT', () => handleShutdown(dependencies, 'SIGINT'));
  process.on('SIGTERM', () => handleShutdown(dependencies, 'SIGTERM'));
}

startScheduler();
