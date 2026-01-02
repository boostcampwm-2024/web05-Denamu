const globalAny: any = global;

export default async () => {
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

  console.log('Global teardown completed.');
};
