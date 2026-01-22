import 'reflect-metadata';
import './common/env-load';
import logger from './common/logger';
import { InfoCodes, ErrorCodes } from './common/log-codes';
import { FeedCrawler } from './feed-crawler';
import { container } from './container';
import { DEPENDENCY_SYMBOLS } from './types/dependency-symbols';
import { DatabaseConnection } from './types/database-connection';
import { ClaudeEventWorker } from './event_worker/workers/claude-event-worker';
import * as schedule from 'node-schedule';
import { RedisConnection } from './common/redis-access';
import { FullFeedCrawlEventWorker } from './event_worker/workers/full-feed-crawl-event-worker';
import { RabbitMQManager } from './common/rabbitmq.manager';

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
    logger.info('크롤링 작업 시작', {
      code: InfoCodes.FC_CRAWL_START,
      context: 'Scheduler',
    });
    void dependencies.feedCrawler.start(new Date());
  });

  schedule.scheduleJob(
    'AI API PER MINUTE REQUEST RATE LIMIT',
    `*/1 * * * *`,
    () => {
      logger.info('AI Worker 시작', {
        code: InfoCodes.FC_WORKER_START,
        context: 'Scheduler',
        workerId: 'claude-event-worker',
      });
      void dependencies.claudeEventWorker.start();
    },
  );

  schedule.scheduleJob('FULL FEED CRAWLING', '*/5 * * * *', () => {
    logger.info('전체 피드 크롤링 시작', {
      code: InfoCodes.FC_FULL_CRAWL_START,
      context: 'Scheduler',
    });
    void dependencies.fullFeedCrawlEventWorker.start();
  });
}

async function handleShutdown(
  dependencies: ReturnType<typeof initializeDependencies>,
  signal: string,
) {
  logger.info(`종료 신호 수신: ${signal}`, {
    code: InfoCodes.FC_SHUTDOWN_SIGNAL,
    context: 'Shutdown',
    signal,
  });
  await dependencies.dbConnection.end();
  await dependencies.redisConnection.quit();
  await dependencies.rabbitMQManager.disconnect();
  logger.info('모든 연결 종료 완료', {
    code: InfoCodes.FC_CONNECTIONS_CLOSED,
    context: 'Shutdown',
  });
  process.exit(0);
}

async function startScheduler() {
  logger.info('스케줄러 시작', {
    code: InfoCodes.FC_SCHEDULER_START,
    context: 'Scheduler',
    cronExpressions: ['0,30 * * * *', '*/1 * * * *', '*/5 * * * *'],
  });

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
    logger.info('RabbitMQ 초기화 시작', {
      code: InfoCodes.FC_RABBITMQ_INIT_START,
      context: 'RabbitMQ',
    });

    await dependencies.rabbitMQManager.connect();

    logger.info('RabbitMQ 초기화 완료', {
      code: InfoCodes.FC_RABBITMQ_INIT_COMPLETE,
      context: 'RabbitMQ',
    });
  } catch (error) {
    logger.error(`RabbitMQ 초기화 실패: ${(error as Error).message}`, {
      code: ErrorCodes.FC_RABBITMQ_INIT_ERROR,
      context: 'RabbitMQ',
      stack: (error as Error).stack,
    });
    throw error;
  }
}

startScheduler().catch((error) => {
  logger.error(`스케줄러 시작 실패: ${error.message}`, {
    code: ErrorCodes.FC_SCHEDULER_START_ERROR,
    context: 'Scheduler',
    stack: error.stack,
  });
  process.exit(1);
});
