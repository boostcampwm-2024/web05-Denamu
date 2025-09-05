import 'reflect-metadata';
import './common/env-load';
import logger from './common/logger';
import { FeedCrawler } from './feed-crawler';
import { container } from './container';
import { DEPENDENCY_SYMBOLS } from './types/dependency-symbols';
import { DatabaseConnection } from './types/database-connection';
import { ClaudeService } from './claude.service';
import * as schedule from 'node-schedule';
import { RedisConnection } from './common/redis-access';

function initializeDependencies() {
  return {
    dbConnection: container.resolve<DatabaseConnection>(
      DEPENDENCY_SYMBOLS.DatabaseConnection,
    ),
    redisConnection: container.resolve<RedisConnection>(
      DEPENDENCY_SYMBOLS.RedisConnection,
    ),
    feedCrawler: container.resolve<FeedCrawler>(DEPENDENCY_SYMBOLS.FeedCrawler),
    claudeService: container.resolve<ClaudeService>(
      DEPENDENCY_SYMBOLS.ClaudeService,
    ),
  };
}

function registerSchedulers(
  dependencies: ReturnType<typeof initializeDependencies>,
) {
  schedule.scheduleJob('FEED CRAWLING', '0,30 * * * *', async () => {
    const now = new Date();
    logger.info(`Feed Crawling Start: ${now.toISOString()}`);
    dependencies.feedCrawler.start(now);
  });

  schedule.scheduleJob(
    'AI API PER MINUTE REQUEST RATE LIMIT',
    '*/1 * * * *',
    () => {
      logger.info(`AI Request Start: ${new Date().toISOString()}`);
      dependencies.claudeService.startRequestAI();
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
