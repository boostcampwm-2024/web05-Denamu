import { setupTestContainer } from '@test/setup/testContext.setup';
import { ResultSetHeader } from 'mysql2';

import { redisConstant } from '@common/redis/redis.constant';

import { FeedCrawler } from '../../src/feed-crawler';

describe('AI 요약 재요청 e2e-test', () => {
  const testContext = setupTestContainer();
  let feedCrawler: FeedCrawler;
  let rssId: number;
  let feedId: number;
  const feedPath = 'https://requeue-test.com/post1';

  beforeAll(async () => {
    feedCrawler = testContext.feedCrawler;

    const rssData = (await testContext.dbConnection.executeQuery(
      `INSERT INTO rss_accept (name, user_name, email, rss_url, platform) VALUES (?, ?, ?, ?, ?)`,
      [
        'requeue blog',
        'tester',
        'test@test.com',
        'https://requeue-test.com/rss',
        'etc',
      ],
    )) as any as ResultSetHeader;
    rssId = rssData.insertId;

    const feedData = (await testContext.dbConnection.executeQuery(
      `INSERT INTO feed (created_at, title, path, thumbnail, blog_id) VALUES (?, ?, ?, ?, ?)`,
      [new Date(), 'requeue title', feedPath, 'thumb', rssId],
    )) as any as ResultSetHeader;
    feedId = feedData.insertId;
  });

  it('RSS에서 매칭되는 게시글을 찾으면 AI 큐에 다시 적재된다.', async () => {
    // given - RSS 파싱 결과가 DB의 feed.path와 동일한 link를 갖도록 모킹
    jest
      .spyOn(testContext.feedParserManager, 'fetchAndParseAll')
      .mockResolvedValue({
        feeds: [
          {
            id: null,
            blogId: rssId,
            title: 'requeue title',
            link: feedPath,
            pubDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
            thumbnail: 'thumb',
            content: 'requeue content',
            summary: '요약 생성 중...',
            deathCount: 0,
          },
        ],
        rssObj: {
          id: rssId,
          blogName: 'requeue blog',
          blogPlatform: 'etc',
          rssUrl: 'https://requeue-test.com/rss',
          blogImage: null,
        },
      });

    // when
    await feedCrawler.requeueFeedForAiSummary(feedId);

    // then - 실제 feed/rss repository를 거쳐 Redis AI 큐에 적재됨
    const aiQueue = await testContext.redisConnection.executePipeline(
      (pipeline) => {
        pipeline.lrange(redisConstant.FEED_AI_QUEUE, 0, -1);
      },
    );
    const queued = (aiQueue[0][1] as string[]).map(
      (item) => JSON.parse(item) as { id: number },
    );

    expect(queued.some((item) => item.id === feedId)).toBe(true);
  });

  it('존재하지 않는 feedId면 PermanentError를 던진다.', async () => {
    await expect(feedCrawler.requeueFeedForAiSummary(999999)).rejects.toThrow(
      '피드를 찾을 수 없습니다: 999999',
    );
  });
});
