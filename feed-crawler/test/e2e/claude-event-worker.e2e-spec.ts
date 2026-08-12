import { setupTestContainer } from '@test/setup/testContext.setup';
import { ResultSetHeader } from 'mysql2';

import { ClaudeEventWorker } from '@event_worker/workers/claude-event-worker';

describe('Claude AI e2e-test', () => {
  const testContext = setupTestContainer();
  let claudeEventWorker: ClaudeEventWorker,
    feedData: ResultSetHeader,
    rssData: ResultSetHeader;
  const feedRedisAiQueueData: any = {
    content: 'test',
    deathCount: 0,
  };

  beforeAll(async () => {
    claudeEventWorker = testContext.claudeEventWorker;

    rssData = (await testContext.dbConnection.executeQuery(
      `INSERT INTO rss_accept (name, user_name, email, rss_url, platform) VALUES (?, ?, ?, ?, ?)`,
      ['test', 'test_name', 'test@test.com', 'https://test.com/rss', 'etc'],
    )) as any as ResultSetHeader;

    feedData = (await testContext.dbConnection.executeQuery(
      `INSERT INTO feed (created_at, title, path, thumbnail, blog_id) VALUES (?, ?, ?, ?, ?)
      `,
      [new Date(), 'test', 'test', 'test', rssData.insertId],
    )) as any as ResultSetHeader;

    await testContext.dbConnection.executeQuery(
      `INSERT INTO tag (name) VALUES (?), (?), (?)`,
      ['test1', 'test2', 'test3'],
    );
  });

  it('피드의 데이터를 요약하고 태그를 받아왔을 때, 태그가 DB 목록에 없다.', async () => {
    // given
    jest
      .spyOn(claudeEventWorker as any, 'loadFeeds')
      .mockResolvedValue([feedRedisAiQueueData]);

    jest.spyOn(claudeEventWorker as any, 'requestAI').mockResolvedValue({
      ...feedRedisAiQueueData,
      id: feedData.insertId,
      summary: 'test summary',
      tagList: ['test4'],
    });

    // when
    await claudeEventWorker.start();

    // then
    const [searchSummary] = await testContext.dbConnection.executeQuery(
      `SELECT * FROM feed WHERE feed.id = ?`,
      [feedData.insertId],
    );
    const tagList = await testContext.dbConnection.executeQuery<{
      name: string;
    }>(
      `SELECT name FROM tag, tag_map WHERE tag.id = tag_map.tag_id AND tag_map.feed_id = ?`,
      [feedData.insertId],
    );

    expect(searchSummary['summary']).toStrictEqual(null);
    expect(tagList.map((t) => t.name)).toStrictEqual([]);
  });

  it('피드의 데이터를 요약하고 요약한 내용을 받아왔을 때, 알맞은 태그가 없다.', async () => {
    // given
    jest
      .spyOn(claudeEventWorker as any, 'loadFeeds')
      .mockResolvedValue([feedRedisAiQueueData]);

    jest.spyOn(claudeEventWorker as any, 'requestAI').mockResolvedValue({
      ...feedRedisAiQueueData,
      id: feedData.insertId,
      summary: 'test summary',
      tagList: [],
    });

    // when
    await claudeEventWorker.start();

    // then
    const [searchSummary] = await testContext.dbConnection.executeQuery(
      `SELECT * FROM feed WHERE feed.id = ?`,
      [feedData.insertId],
    );
    const tagList = await testContext.dbConnection.executeQuery<{
      name: string;
    }>(
      `SELECT name FROM tag, tag_map WHERE tag.id = tag_map.tag_id AND tag_map.feed_id = ?`,
      [feedData.insertId],
    );

    expect(searchSummary['summary']).toStrictEqual('test summary');
    expect(tagList.map((t) => t.name)).toStrictEqual([]);
  });

  it('피드의 데이터를 요약하고 요약한 내용을 받아왔을 때, 요약 내용이 없다.', async () => {
    // given
    jest
      .spyOn(claudeEventWorker as any, 'loadFeeds')
      .mockResolvedValue([feedRedisAiQueueData]);

    jest.spyOn(claudeEventWorker as any, 'requestAI').mockResolvedValue({
      ...feedRedisAiQueueData,
      id: feedData.insertId,
      summary: null,
      tagList: ['test1', 'test2', 'test3'],
    });

    // when
    await claudeEventWorker.start();

    // then
    const [searchSummary] = await testContext.dbConnection.executeQuery(
      `SELECT * FROM feed WHERE feed.id = ?`,
      [feedData.insertId],
    );
    const tagList = await testContext.dbConnection.executeQuery<{
      name: string;
    }>(
      `SELECT name FROM tag, tag_map WHERE tag.id = tag_map.tag_id AND tag_map.feed_id = ?`,
      [feedData.insertId],
    );

    expect(searchSummary['summary']).toStrictEqual(null);
    expect(tagList.map((t) => t.name)).toStrictEqual([
      'test1',
      'test2',
      'test3',
    ]);
  });

  it('피드의 데이터가 있을 경우 올바른 요약과 알맞은 태그를 받았을 경우 데이터 저장을 성공한다.', async () => {
    // given
    jest
      .spyOn(claudeEventWorker as any, 'loadFeeds')
      .mockResolvedValue([feedRedisAiQueueData]);

    jest.spyOn(claudeEventWorker as any, 'requestAI').mockResolvedValue({
      ...feedRedisAiQueueData,
      id: feedData.insertId,
      summary: 'test summary',
      tagList: ['test1', 'test2', 'test3'],
    });

    // when
    await claudeEventWorker.start();

    // then
    const [searchSummary] = await testContext.dbConnection.executeQuery(
      `SELECT * FROM feed WHERE feed.id = ?`,
      [feedData.insertId],
    );
    const tagList = await testContext.dbConnection.executeQuery<{
      name: string;
    }>(
      `SELECT name FROM tag, tag_map WHERE tag.id = tag_map.tag_id AND tag_map.feed_id = ?`,
      [feedData.insertId],
    );

    expect(searchSummary['summary']).toStrictEqual('test summary');
    expect(tagList.map((t) => t.name)).toStrictEqual([
      'test1',
      'test2',
      'test3',
    ]);
  });

  it('최근 게시글 캐시가 존재하면 tagList와 summary를 갱신한다.', async () => {
    // given
    await testContext.redisConnection.hset(
      `feed:info:${feedData.insertId}`,
      'title',
      'test',
      'summary',
      'AI 요약 처리 중...',
    );

    jest
      .spyOn(claudeEventWorker as any, 'loadFeeds')
      .mockResolvedValue([feedRedisAiQueueData]);

    jest.spyOn(claudeEventWorker as any, 'requestAI').mockResolvedValue({
      ...feedRedisAiQueueData,
      id: feedData.insertId,
      summary: 'cache summary',
      tagList: ['test1'],
    });

    // when
    await claudeEventWorker.start();

    // then
    const cached = (await testContext.redisConnection.executePipeline(
      (pipeline) => {
        pipeline.hgetall(`feed:info:${feedData.insertId}`);
      },
    )) as [error: Error, result: Record<string, string>][];

    expect(cached[0][1]).toMatchObject({
      title: 'test',
      summary: 'cache summary',
      tagList: 'test1',
    });
  });

  it('최근 게시글 캐시가 없으면 캐시를 새로 만들지 않는다.', async () => {
    // given
    const uncachedFeedData = (await testContext.dbConnection.executeQuery(
      `INSERT INTO feed (created_at, title, path, thumbnail, blog_id) VALUES (?, ?, ?, ?, ?)`,
      [new Date(), 'uncached', 'uncached-path', 'test', rssData.insertId],
    )) as any as ResultSetHeader;

    jest
      .spyOn(claudeEventWorker as any, 'loadFeeds')
      .mockResolvedValue([feedRedisAiQueueData]);

    jest.spyOn(claudeEventWorker as any, 'requestAI').mockResolvedValue({
      ...feedRedisAiQueueData,
      id: uncachedFeedData.insertId,
      summary: 'no cache summary',
      tagList: ['test1'],
    });

    // when
    await claudeEventWorker.start();

    // then
    const exists = await testContext.redisConnection.exists(
      `feed:info:${uncachedFeedData.insertId}`,
    );
    expect(exists).toBe(false);
  });
});
