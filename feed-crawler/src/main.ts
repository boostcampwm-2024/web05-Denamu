import 'reflect-metadata';

import * as schedule from 'node-schedule';
import { RabbitMQManager } from '@rabbitmq/rabbitmq.manager';

import '@common/env-load';

import { DatabaseConnection } from '@common/database/database-connection';
import { DEPENDENCY_SYMBOLS } from '@common/dependency-symbols';
import { Lifecycle } from '@common/lifecycle/lifecycle.interface';
import logger from '@common/logger/logger';
import { FeedMetrics } from '@common/metrics/feed-metrics';
import { RedisConnection } from '@common/redis/redis-access';

import { AiSummaryRetryEventWorker } from '@event_worker/workers/ai-summary-retry-event-worker';
import { ClaudeEventWorker } from '@event_worker/workers/claude-event-worker';
import { FullFeedCrawlEventWorker } from '@event_worker/workers/full-feed-crawl-event-worker';

import { container } from './container';
import { FeedCrawler } from './feed-crawler';

function initializeDependencies() {
  return {
    dbConnection: container.resolve<DatabaseConnection>(
      DEPENDENCY_SYMBOLS.DatabaseConnection,
    ),
    redisConnection: container.resolve(RedisConnection),
    rabbitMQManager: container.resolve(RabbitMQManager),
    feedCrawler: container.resolve(FeedCrawler),
    claudeEventWorker: container.resolve(ClaudeEventWorker),
    fullFeedCrawlEventWorker: container.resolve(FullFeedCrawlEventWorker),
    aiSummaryRetryEventWorker: container.resolve(AiSummaryRetryEventWorker),
    metrics: container.resolve(FeedMetrics),
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
}

async function handleShutdown(components: Lifecycle[], signal: string) {
  try {
    logger.info(`${signal} 신호 수신, feed-crawler 종료 중...`);

    for (const component of [...components].reverse()) {
      await component.stop?.();
    }

    logger.info('Feed Crawler 정상 종료');
    process.exit(0);
  } catch (error) {
    logger.error(
      `Feed Crawler 종료 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
  }
}

async function startScheduler() {
  try {
    logger.info('[Feed Crawler Scheduler Start]');

    const dependencies = initializeDependencies();

    const components: Lifecycle[] = [
      dependencies.metrics,
      dependencies.dbConnection,
      dependencies.redisConnection,
      dependencies.rabbitMQManager,
      dependencies.fullFeedCrawlEventWorker,
      dependencies.aiSummaryRetryEventWorker,
    ];

    for (const component of components) {
      await component.start?.();
    }

    registerSchedulers(dependencies);

    process.on('SIGINT', () => void handleShutdown(components, 'SIGINT'));
    process.on('SIGTERM', () => void handleShutdown(components, 'SIGTERM'));

    logger.info('[Feed Crawler Scheduler Complete]');
  } catch (error) {
    logger.error(`Feed Crawler 스케줄러 시작 실패: ${error}`);
    process.exit(1);
  }
}

void startScheduler();
