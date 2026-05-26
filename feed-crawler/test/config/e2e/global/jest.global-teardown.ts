type GlobalWithContainer = typeof global & { __MYSQL_CONTAINER__?: { stop: () => Promise<void> } };
const globalAny = global as GlobalWithContainer;

export default async function globalTeardown() {
  console.log('Stopping MySQL container...');
  if (globalAny.__MYSQL_CONTAINER__) {
    await globalAny.__MYSQL_CONTAINER__.stop();
    delete globalAny.__MYSQL_CONTAINER__;
  }

  console.log('Global teardown completed.');
}
