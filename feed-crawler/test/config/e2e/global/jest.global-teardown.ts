type GlobalWithContainer = typeof global & { __MYSQL_CONTAINER__?: { stop: () => Promise<void> } };
const globalAny = global as GlobalWithContainer;

export default async function globalTeardown() {
  const startTime = process.hrtime.bigint();
  console.log('Stopping MySQL container...');
  if (globalAny.__MYSQL_CONTAINER__) {
    await globalAny.__MYSQL_CONTAINER__.stop();
    delete globalAny.__MYSQL_CONTAINER__;
  }

  const elapsedMs = Number(process.hrtime.bigint() - startTime) / 1_000_000;
  console.log(`Global teardown completed. Elapsed time: ${elapsedMs.toFixed(2)} ms`);
}
