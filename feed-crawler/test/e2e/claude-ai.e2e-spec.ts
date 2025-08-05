import { ResultSetHeader } from 'mysql2';
import { ClaudeService } from '../../src/claude.service';
import { setupTestContainer } from '../setup/testContext.setup';

describe('Claude AI e2e-test', () => {
  const testContext = setupTestContainer();
  let claudeService: ClaudeService, feedData;
  const feedRedisAiQueueData: any = {
    content: 'test',
    deathCount: 0,
  };

  beforeAll(async () => {
    claudeService = new ClaudeService(
      testContext.tagMapRepository,
      testContext.feedRepository,
      testContext.redisConnection,
    );

    const rssData = (await testContext.dbConnection.executeQuery(
      `INSERT INTO rss_accept (name, user_name, email, rss_url, blog_platform) VALUES (?, ?, ?, ?, ?)`,
      ['test', 'test_name', 'test@test.com', 'https://test.com/rss', 'etc'],
    )) as any as ResultSetHeader;

    feedData = (await testContext.dbConnection.executeQuery(
      `INSERT INTO feed (created_at, title, path, thumbnail, blog_id) VALUES (?, ?, ?, ?, ?)
      `,
      [new Date(), 'test', 'test', 'test', rssData.insertId],
    )) as any;

    await testContext.dbConnection.executeQuery(
      `INSERT INTO tag (name) VALUES (?), (?), (?)`,
      ['test1', 'test2', 'test3'],
    );
  });

  it('피드의 데이터를 요약하고 태그를 받아왔을 때, 태그가 DB 목록에 없다.', async () => {
    // given
    jest
      .spyOn(claudeService as any, 'loadFeeds')
      .mockResolvedValue([feedRedisAiQueueData]);

    jest.spyOn(claudeService as any, 'requestAI').mockResolvedValue({
      ...feedRedisAiQueueData,
      id: feedData.insertId,
      summary: 'test summary',
      tagList: ['test4'],
    });

    // when
    await claudeService.startRequestAI();

    // then
    const [searchSummary] = await testContext.dbConnection.executeQuery(
      `SELECT * FROM feed WHERE feed.id = ?`,
      [feedData.insertId],
    );
    const tagList = await testContext.dbConnection.executeQuery(
      `SELECT name FROM tag, tag_map WHERE tag.id = tag_map.tag_id AND tag_map.feed_id = ?`,
      [feedData.insertId],
    );

    expect(searchSummary['summary']).toStrictEqual(null);
    expect(tagList.map((t: any) => t.name)).toStrictEqual([]);
  });

  it('피드의 데이터를 요약하고 요약한 내용을 받아왔을 때, 알맞은 태그가 없다.', async () => {
    // given
    jest
      .spyOn(claudeService as any, 'loadFeeds')
      .mockResolvedValue([feedRedisAiQueueData]);

    jest.spyOn(claudeService as any, 'requestAI').mockResolvedValue({
      ...feedRedisAiQueueData,
      id: feedData.insertId,
      summary: 'test summary',
      tagList: [],
    });

    // when
    await claudeService.startRequestAI();

    // then
    const [searchSummary] = await testContext.dbConnection.executeQuery(
      `SELECT * FROM feed WHERE feed.id = ?`,
      [feedData.insertId],
    );
    const tagList = await testContext.dbConnection.executeQuery(
      `SELECT name FROM tag, tag_map WHERE tag.id = tag_map.tag_id AND tag_map.feed_id = ?`,
      [feedData.insertId],
    );

    expect(searchSummary['summary']).toStrictEqual('test summary');
    expect(tagList.map((t: any) => t.name)).toStrictEqual([]);
  });

  it('피드의 데이터를 요약하고 요약한 내용을 받아왔을 때, 요약 내용이 없다.', async () => {
    // given
    jest
      .spyOn(claudeService as any, 'loadFeeds')
      .mockResolvedValue([feedRedisAiQueueData]);

    jest.spyOn(claudeService as any, 'requestAI').mockResolvedValue({
      ...feedRedisAiQueueData,
      id: feedData.insertId,
      summary: null,
      tagList: ['test1', 'test2', 'test3'],
    });

    // when
    await claudeService.startRequestAI();

    // then
    const [searchSummary] = await testContext.dbConnection.executeQuery(
      `SELECT * FROM feed WHERE feed.id = ?`,
      [feedData.insertId],
    );
    const tagList = await testContext.dbConnection.executeQuery(
      `SELECT name FROM tag, tag_map WHERE tag.id = tag_map.tag_id AND tag_map.feed_id = ?`,
      [feedData.insertId],
    );

    expect(searchSummary['summary']).toStrictEqual(null);
    expect(tagList.map((t: any) => t.name)).toStrictEqual([
      'test1',
      'test2',
      'test3',
    ]);
  });

  it('피드의 데이터가 있을 경우 올바른 요약과 알맞은 태그를 받았을 경우 데이터 저장을 성공한다.', async () => {
    // given
    jest
      .spyOn(claudeService as any, 'loadFeeds')
      .mockResolvedValue([feedRedisAiQueueData]);

    jest.spyOn(claudeService as any, 'requestAI').mockResolvedValue({
      ...feedRedisAiQueueData,
      id: feedData.insertId,
      summary: 'test summary',
      tagList: ['test1', 'test2', 'test3'],
    });

    // when
    await claudeService.startRequestAI();

    // then
    const [searchSummary] = await testContext.dbConnection.executeQuery(
      `SELECT * FROM feed WHERE feed.id = ?`,
      [feedData.insertId],
    );
    const tagList = await testContext.dbConnection.executeQuery(
      `SELECT name FROM tag, tag_map WHERE tag.id = tag_map.tag_id AND tag_map.feed_id = ?`,
      [feedData.insertId],
    );

    expect(searchSummary['summary']).toStrictEqual('test summary');
    expect(tagList.map((t: any) => t.name)).toStrictEqual([
      'test1',
      'test2',
      'test3',
    ]);
  });
});
