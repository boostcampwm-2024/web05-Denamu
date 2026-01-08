const globalAny: any = global;

export default async function globalTeardown() {
  console.log('Stopping MySQL container...');
  if (globalAny.__MYSQL_CONTAINER__) {
    await globalAny.__MYSQL_CONTAINER__.stop();
    delete globalAny.__MYSQL_CONTAINER__;
  }

  console.log('Global teardown completed.');
}
