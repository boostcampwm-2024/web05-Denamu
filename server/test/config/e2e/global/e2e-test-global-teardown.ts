const globalAny: any = global;

export default async () => {
  const startTime = process.hrtime.bigint();
  deleteMysqlContainer();
  deleteRedisContainer();
  deleteRabbitMQContainer();
  const endTime = process.hrtime.bigint();
  const elapsedMs = Number(endTime - startTime) / 1_000_000;

  console.log(
    `Global teardown completed. Elapsed time: ${elapsedMs.toFixed(2)} ms`,
  );
};

const deleteMysqlContainer = async () => {
  console.log('Stopping MySQL container...');
  if (globalAny.__MYSQL_CONTAINER__) {
    await globalAny.__MYSQL_CONTAINER__.stop();
    delete globalAny.__MYSQL_CONTAINER__;
  }
};

const deleteRedisContainer = async () => {
  console.log('Stopping Redis container...');
  if (globalAny.__REDIS_CONTAINER__) {
    await globalAny.__REDIS_CONTAINER__.stop();
    delete globalAny.__REDIS_CONTAINER__;
  }
};

const deleteRabbitMQContainer = async () => {
  console.log('Stopping RabbitMQ container...');
  if (globalAny.__RABBITMQ_CONTAINER__) {
    await globalAny.__RABBITMQ_CONTAINER__.stop();
    delete globalAny.__RABBITMQ_CONTAINER__;
  }
};
