import { setupTestContainer } from './testContext.setup';
import { redisConstant } from '../../src/common/constant';

afterEach(async () => {
  const testContext = setupTestContainer();
  await testContext.dbConnection.executeQuery(`DELETE FROM feed;`, []);
  await testContext.dbConnection.executeQuery(`DELETE FROM rss_accept;`, []);
  await testContext.redisConnection.del(redisConstant.FEED_RECENT_ALL_KEY);
});
