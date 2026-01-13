import 'reflect-metadata';
import '@common/env-load';
import logger from '@common/logger';
import { FeedCrawler } from '@src/feed-crawler';
import { container } from '@src/container';
import { DEPENDENCY_SYMBOLS } from '@app-types/dependency-symbols';
import { DatabaseConnection } from '@app-types/database-connection';
import { ClaudeEventWorker } from '@event_worker/workers/claude-event-worker';
import * as schedule from 'node-schedule';
import { RedisConnection } from '@common/redis-access';
import { FullFeedCrawlEventWorker } from '@event_worker/workers/full-feed-crawl-event-worker';
import { RabbitMQManager } from '@common/rabbitmq.manager';

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
    rabbitMQManager: container.resolve<RabbitMQManager>(
      DEPENDENCY_SYMBOLS.RabbitMQManager,
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
  await dependencies.rabbitMQManager.disconnect();
  logger.info('DB, Redis, RabbitMQ 연결 종료');
  process.exit(0);
}

async function startScheduler() {
  logger.info('[Feed Crawler Scheduler Start]');

  const dependencies = initializeDependencies();
  await initializeRabbitMQ(dependencies);
  registerSchedulers(dependencies);

  process.on('SIGINT', () => void handleShutdown(dependencies, 'SIGINT'));
  process.on('SIGTERM', () => void handleShutdown(dependencies, 'SIGTERM'));
}

async function initializeRabbitMQ(
  dependencies: ReturnType<typeof initializeDependencies>,
) {
  try {
    logger.info(`RabbitMQ 초기화 시작...`);

    await dependencies.rabbitMQManager.connect();

    logger.info(`RabbitMQ 초기화 완료`);
  } catch (error) {
    logger.error(`RabbitMQ 초기화 실패:`, error);
    throw error;
  }
}

startScheduler().catch((error) => {
  logger.error(`스케줄러 시작 실패: `, error);
  process.exit(1);
});
