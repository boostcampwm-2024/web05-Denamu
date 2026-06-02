interface TestGlobal {
  __RABBITMQ_CONTAINER__?: { stop(): Promise<unknown> };
  __MAILPIT_CONTAINER__?: { stop(): Promise<unknown> };
}
const globalAny = global as unknown as TestGlobal;

export default async () => {
  const startTime = process.hrtime.bigint();
  console.log('Stopping RabbitMQ container...');
  if (globalAny.__RABBITMQ_CONTAINER__) {
    await globalAny.__RABBITMQ_CONTAINER__.stop();
    delete globalAny.__RABBITMQ_CONTAINER__;
  }

  console.log('Stopping Mailpit container...');
  if (globalAny.__MAILPIT_CONTAINER__) {
    await globalAny.__MAILPIT_CONTAINER__.stop();
    delete globalAny.__MAILPIT_CONTAINER__;
  }

  const elapsedMs = Number(process.hrtime.bigint() - startTime) / 1_000_000;
  console.log(`Global teardown completed. Elapsed time: ${elapsedMs.toFixed(2)} ms`);
};
