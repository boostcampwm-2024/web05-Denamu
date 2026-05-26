import 'reflect-metadata';

import { DEPENDENCY_SYMBOLS } from '@common/dependency-symbols';
import '@common/env/env-load';
import logger from '@common/logger/logger';

import { EmailConsumer } from '@email/email.consumer';

import { Notifier } from '@notification/notifier.interface';

import { RabbitMQManager } from '@rabbitmq/rabbitmq.manager';

import { container } from './container';

function initializeDependencies() {
  return {
    rabbitMQManager: container.resolve(RabbitMQManager),
    emailConsumer: container.resolve(EmailConsumer),
    notifier: container.resolve<Notifier>(DEPENDENCY_SYMBOLS.Notifier),
  };
}

async function startEmailWorker() {
  try {
    logger.info('[Email Worker Start]');

    const dependencies = initializeDependencies();
    dependencies.notifier.initialize();
    logger.info(`Notifier 초기화 완료`);
    await initializeRabbitMQ(dependencies);

    process.on('SIGINT', () => void handleShutdown(dependencies, 'SIGINT'));
    process.on('SIGTERM', () => void handleShutdown(dependencies, 'SIGTERM'));
  } catch (error) {
    logger.error(
      `Email Worker 시작 실패: ${error instanceof Error ? error.message : error}`,
    );
    process.exit(1);
  }
}

async function handleShutdown(
  dependencies: ReturnType<typeof initializeDependencies>,
  signal: string,
) {
  try {
    logger.info(`${signal} 신호 수신, email-worker 종료 중...`);

    logger.info('새로운 메시지 수신 중지...');
    await dependencies.emailConsumer.stopConsuming();

    logger.info('진행 중인 이메일 전송 작업 완료 대기...');
    await dependencies.emailConsumer.waitForPendingTasks();

    logger.info('Consumer 정리 중...');
    await dependencies.emailConsumer.close();

    logger.info('RabbitMQ 연결 종료 중...');
    await dependencies.rabbitMQManager.disconnect();

    logger.info('Email Worker 정상 종료');
    process.exit(0);
  } catch (error) {
    logger.error(
      `Email Worker 종료 중 에러 발생: ${error instanceof Error ? error.message : error}`,
    );
    process.exit(1);
  }
}

async function initializeRabbitMQ(
  dependencies: ReturnType<typeof initializeDependencies>,
) {
  try {
    logger.info(`RabbitMQ 초기화 시작...`);

    await dependencies.rabbitMQManager.connect();
    logger.info(`RabbitMQ 초기화 완료`);

    await dependencies.emailConsumer.start();
    logger.info(`RabbitMQ Email Consumer 시작 완료`);
  } catch (error) {
    logger.error(
      `RabbitMQ 초기화 실패: ${error instanceof Error ? error.message : error}`,
    );
    throw error;
  }
}

void startEmailWorker();
