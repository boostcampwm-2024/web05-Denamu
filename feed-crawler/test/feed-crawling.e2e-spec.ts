import { setupTestContainer } from './setup/testContext.setup';
import { FeedCrawler } from '../src/feed-crawler';
import { redisConstant } from '../src/common/constant';

describe('feed crawling e2e-test', () => {
  const testContext = setupTestContainer();
  let feedCrawler: FeedCrawler;

  beforeAll(async () => {
    feedCrawler = new FeedCrawler(
      testContext.rssRepository,
      testContext.feedRepository,
      testContext.rssParser
    );
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('RSS 피드가 정상적으로 DB, Redis에 저장된다.', async () => {
    jest.spyOn(feedCrawler as any, "fetchRss").mockResolvedValue([
      {
        title: "Mock Title",
        link: "https://example.com/mock",
        pubDate: Date.now(),
        description: "Mock Content",
      },
    ]);

    jest
      .spyOn((feedCrawler as any).rssParser, "getThumbnailUrl")
      .mockResolvedValue("https://example.com/mock/thumbnail");

    // given
    await testContext.dbConnection.executeQuery(
      `INSERT INTO rss_accept (name, user_name, email, rss_url, blog_platform) 
       VALUES (?, ?, ?, ?, ?)`,
      ["test blog", "tester", "test@test.com", "https://test.com/rss", "etc"],
    );

    // when
    await feedCrawler.start();

    // then
    const feedsFromDB = await testContext.dbConnection.executeQuery(
      'SELECT * FROM feed',
      [],
    );
    const recentFeedsKeys = [];
    let cursor = '0';
    do {
      const [newCursor, keys] = await testContext.redisConnection.scan(
        cursor,
        redisConstant.FEED_RECENT_ALL_KEY,
        100
      );
      recentFeedsKeys.push(...keys);
      cursor = newCursor;
    } while (cursor !== '0');
    const tags = await testContext.dbConnection.executeQuery(
      'SELECT * FROM tag_map',
      [],
    );

    const aiQueue = await testContext.redisConnection.executePipeline(
      (pipeline) => {
        pipeline.lrange(redisConstant.FEED_AI_QUEUE, 0, -1);
      }
    );
    const aiQueueData = JSON.parse(aiQueue[0][1] as string);

    expect(feedsFromDB.length).not.toBe(0);
    expect(recentFeedsKeys.length).not.toBe(0);
    expect(aiQueueData).toHaveProperty("content", "Mock Content");
  });

  it('RSS URL이 잘못된 경우 에러 로그를 남기고 계속 진행한다', async () => {
    // given
    await testContext.dbConnection.executeQuery(
      `INSERT INTO rss_accept (name, user_name, email, rss_url, blog_platform) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        'Wrong Test',
        'tester',
        'test@test.com',
        'https://test.tistory.com/test',
        'tistory',
      ],
    );
    // when
    await feedCrawler.start();

    // then
    const feeds = await testContext.dbConnection.executeQuery(
      'SELECT * FROM feed',
      [],
    );
    expect(feeds.length).toBe(0);
  });
});
