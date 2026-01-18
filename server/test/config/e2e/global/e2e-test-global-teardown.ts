import {
  mysqlContainer,
  rabbitMQContainer,
  redisContainer,
} from './e2e-test-global-setup';

export default async () => {
  const startTime = process.hrtime.bigint();
  await Promise.all([
    deleteMysqlContainer(),
    deleteRedisContainer(),
    deleteRabbitMQContainer(),
  ]);
  const endTime = process.hrtime.bigint();
  const elapsedMs = Number(endTime - startTime) / 1_000_000;

  console.log(
    `Global teardown completed. Elapsed time: ${elapsedMs.toFixed(2)} ms`,
  );
};

const deleteMysqlContainer = async () => {
  console.log('Stopping MySQL container...');
  if (mysqlContainer) {
    await mysqlContainer.stop();
  }
};

const deleteRedisContainer = async () => {
  console.log('Stopping Redis container...');
  if (redisContainer) {
    await redisContainer.stop();
  }
};

const deleteRabbitMQContainer = async () => {
  console.log('Stopping RabbitMQ container...');
  if (rabbitMQContainer) {
    await rabbitMQContainer.stop();
  }
};
