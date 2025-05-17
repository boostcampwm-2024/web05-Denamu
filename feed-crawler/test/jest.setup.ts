import { setupTestContainer } from './setup/testContext.setup';

beforeEach(() => {
  jest.restoreAllMocks();
});

afterAll(async () => {
  const testContext = setupTestContainer();
  await testContext.dbConnection.executeQuery('SET FOREIGN_KEY_CHECKS = 0', []);
  await testContext.dbConnection.executeQuery('TRUNCATE TABLE tag_map', []);
  await testContext.dbConnection.executeQuery('TRUNCATE TABLE tag', []);
  await testContext.dbConnection.executeQuery('TRUNCATE TABLE feed', []);
  await testContext.dbConnection.executeQuery('TRUNCATE TABLE rss_accept', []);
  await testContext.dbConnection.executeQuery('SET FOREIGN_KEY_CHECKS = 1', []);
  await testContext.redisConnection.flushall();
});
