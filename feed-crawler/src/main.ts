import 'reflect-metadata';

import * as schedule from 'node-schedule';

import '@common/env-load';

import { DatabaseConnection } from '@common/database/database-connection';
import { DEPENDENCY_SYMBOLS } from '@common/dependency-symbols';
import logger from '@common/logger/logger';
import { FeedMetrics } from '@common/metrics/feed-metrics';
import { Notifier } from '@common/notification/notifier.interface';
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
    feedCrawler: container.resolve(FeedCrawler),
    claudeEventWorker: container.resolve(ClaudeEventWorker),
    fullFeedCrawlEventWorker: container.resolve(FullFeedCrawlEventWorker),
    aiSummaryRetryEventWorker: container.resolve(AiSummaryRetryEventWorker),
    notifier: container.resolve<Notifier>(DEPENDENCY_SYMBOLS.Notifier),
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

  schedule.scheduleJob('FULL FEED CRAWLING', '*/5 * * * *', () => {
    logger.info(`Full Feed Crawling Start: ${new Date().toISOString()}`);
    void dependencies.fullFeedCrawlEventWorker.start();
  });

  schedule.scheduleJob('AI SUMMARY RETRY', '*/1 * * * *', () => {
    logger.info(`AI Summary Retry Start: ${new Date().toISOString()}`);
    void dependencies.aiSummaryRetryEventWorker.start();
  });
}

async function handleShutdown(
  dependencies: ReturnType<typeof initializeDependencies>,
  signal: string,
) {
  try {
    logger.info(`${signal} 신호 수신, feed-crawler 종료 중...`);

    logger.info('데이터 베이스 연결 종료 중...');
    await dependencies.dbConnection.end();

    logger.info('Redis 연결 종료 중...');
    await dependencies.redisConnection.quit();

    logger.info('Feed Crawler 정상 종료');
    process.exit(0);
  } catch (error) {
    logger.error(
      `Feed Crawler 종료 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
  }
}

function startScheduler() {
  try {
    logger.info('[Feed Crawler Scheduler Start]');

    const metricsPort = Number(process.env.FEED_CRAWLER_METRICS_PORT) || 9092;

    const dependencies = initializeDependencies();
    dependencies.metrics.startMetricsServer(metricsPort);
    logger.info(`Metrics server started on port ${metricsPort}`);
    dependencies.notifier.initialize();
    registerSchedulers(dependencies);

    process.on('SIGINT', () => void handleShutdown(dependencies, 'SIGINT'));
    process.on('SIGTERM', () => void handleShutdown(dependencies, 'SIGTERM'));

    logger.info('[Feed Crawler Scheduler Complete]');
  } catch (error) {
    logger.error(`Feed Crawler 스케줄러 시작 실패: ${error}`);
    process.exit(1);
  }
}

startScheduler();
