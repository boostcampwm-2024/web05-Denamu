import 'reflect-metadata';

import * as schedule from 'node-schedule';

import '@common/env-load';

import { container } from '@src/container';
import { FeedCrawler } from '@src/feed-crawler';

import logger from '@common/logger';
import { RedisConnection } from '@common/redis-access';

import { ClaudeEventWorker } from '@event_worker/workers/claude-event-worker';
import { FullFeedCrawlEventWorker } from '@event_worker/workers/full-feed-crawl-event-worker';

import { DatabaseConnection } from '@app-types/database-connection';
import { DEPENDENCY_SYMBOLS } from '@app-types/dependency-symbols';

function initializeDependencies() {
  return {
    dbConnection: container.resolve<DatabaseConnection>(
      DEPENDENCY_SYMBOLS.DatabaseConnection,
    ),
    redisConnection: container.resolve<RedisConnection>(
      DEPENDENCY_SYMBOLS.RedisConnection,
    ),
    feedCrawler: container.resolve<FeedCrawler>(DEPENDENCY_SYMBOLS.FeedCrawler),
    claudeEventWorker: container.resolve<ClaudeEventWorker>(
      DEPENDENCY_SYMBOLS.ClaudeEventWorker,
    ),
    fullFeedCrawlEventWorker: container.resolve<FullFeedCrawlEventWorker>(
      DEPENDENCY_SYMBOLS.FullFeedCrawlEventWorker,
    ),
  };
}

function registerSchedulers(
  dependencies: ReturnType<typeof initializeDependencies>,
) {
  schedule.scheduleJob('FEED CRAWLING', '0,30 * * * *', () => {
    const now = new Date();
    logger.info(`Feed Crawling Start: ${now.toISOString()}`);
    void dependencies.feedCrawler.start(now);
  });

  schedule.scheduleJob(
    'AI API PER MINUTE REQUEST RATE LIMIT',
    `*/1 * * * *`,
    () => {
      logger.info(`AI Request Start: ${new Date().toISOString()}`);
      void dependencies.claudeEventWorker.start();
    },
  );

  schedule.scheduleJob('FULL FEED CRAWLING', '*/5 * * * *', () => {
    logger.info(`Full Feed Crawling Start: ${new Date().toISOString()}`);
    void dependencies.fullFeedCrawlEventWorker.start();
  });
}

async function handleShutdown(
  dependencies: ReturnType<typeof initializeDependencies>,
  signal: string,
) {
  logger.info(`${signal} 신호 수신, feed-crawler 종료 중...`);
  await dependencies.dbConnection.end();
  await dependencies.redisConnection.quit();
  logger.info('DB, Redis 연결 종료');
  process.exit(0);
}

async function startScheduler() {
  logger.info('[Feed Crawler Scheduler Start]');

  const dependencies = initializeDependencies();
  registerSchedulers(dependencies);

  process.on('SIGINT', () => void handleShutdown(dependencies, 'SIGINT'));
  process.on('SIGTERM', () => void handleShutdown(dependencies, 'SIGTERM'));
}

startScheduler().catch((error) => {
  logger.error(`스케줄러 시작 실패: `, error);
  process.exit(1);
});
