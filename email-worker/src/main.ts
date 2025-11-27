import 'reflect-metadata';
import './env-load';
import { container } from './container';
import { DEPENDENCY_SYMBOLS } from './types/dependency-symbols';
import { RabbitMQManager } from './rabbitmq/rabbitmq.manager';
import { EmailConsumer } from './email/email.consumer';
import logger from './logger';

function initializeDependencies() {
  return {
    rabbitMQManager: container.resolve<RabbitMQManager>(
      DEPENDENCY_SYMBOLS.RabbitMQManager,
    ),
    emailConsumer: container.resolve<EmailConsumer>(
      DEPENDENCY_SYMBOLS.EmailConsumer,
    ),
  };
}

async function startEmailWorker() {
  logger.info('[Email Worker Start]');

  const dependencies = initializeDependencies();
  await initializeRabbitMQ(dependencies);

  process.on('SIGINT', () => handleShutdown(dependencies, 'SIGINT'));
  process.on('SIGTERM', () => handleShutdown(dependencies, 'SIGTERM'));
}

async function handleShutdown(
  dependencies: ReturnType<typeof initializeDependencies>,
  signal: string,
) {
  logger.info(`${signal} 신호 수신, email-worker 종료 중...`);
  try {
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
    logger.error(`Email Worker 종료 중 에러 발생: ${error}`);
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
    logger.error(`RabbitMQ 초기화 실패: ${error}`);
    throw error;
  }
}

startEmailWorker().catch((error) => {
  logger.error(`Email Consumer 시작 실패: ${error}`);
  process.exit(1);
});
