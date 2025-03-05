const globalAny: any = global;

export default async () => {
  console.log('Stopping MySQL container...');
  if (globalAny.__MYSQL_CONTAINER__) {
    await globalAny.__MYSQL_CONTAINER__.stop();
    delete globalAny.__MYSQL_CONTAINER__;
  }

  console.log('Stopping Redis container...');
  if (globalAny.__REDIS_CONTAINER__) {
    await globalAny.__REDIS_CONTAINER__.stop();
    delete globalAny.__REDIS_CONTAINER__;
  }

  console.log('Global teardown completed.');
};
