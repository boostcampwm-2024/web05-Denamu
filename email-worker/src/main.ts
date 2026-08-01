import 'reflect-metadata';

import { DEPENDENCY_SYMBOLS } from '@common/dependency-symbols';
import '@common/env/env-load';
import { Lifecycle } from '@common/lifecycle/lifecycle.interface';
import logger from '@common/logger/logger';
import { EmailMetrics } from '@common/metrics/email-metrics';

import { EmailConsumer } from '@email/email.consumer';

import { Notifier } from '@notification/notifier.interface';

import { RabbitMQManager } from '@rabbitmq/rabbitmq.manager';

import { container } from './container';

function resolveComponents(): Lifecycle[] {
  return [
    container.resolve(EmailMetrics),
    container.resolve<Notifier>(DEPENDENCY_SYMBOLS.Notifier),
    container.resolve(RabbitMQManager),
    container.resolve(EmailConsumer),
  ];
}

async function startEmailWorker() {
  const components = resolveComponents();

  try {
    logger.info('[Email Worker Start]');

    for (const component of components) {
      await component.start();
    }

    process.on('SIGINT', () => void handleShutdown(components, 'SIGINT'));
    process.on('SIGTERM', () => void handleShutdown(components, 'SIGTERM'));
  } catch (error) {
    logger.error(
      `Email Worker 시작 실패: ${error instanceof Error ? error.message : error}`,
    );
    process.exit(1);
  }
}

async function handleShutdown(components: Lifecycle[], signal: string) {
  try {
    logger.info(`${signal} 신호 수신, email-worker 종료 중...`);

    for (const component of [...components].reverse()) {
      await component.stop?.();
    }

    logger.info('Email Worker 정상 종료');
    process.exit(0);
  } catch (error) {
    logger.error(
      `Email Worker 종료 중 에러 발생: ${error instanceof Error ? error.message : error}`,
    );
    process.exit(1);
  }
}

void startEmailWorker();
