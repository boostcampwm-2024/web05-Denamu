import { ClaudeService } from '../src/claude.service';
import { setupTestContainer } from './setup/testContext.setup';

describe('Claude AI e2e-test', () => {
  const testContext = setupTestContainer();
  let claudeService: ClaudeService;
  let feedInformation = {
    id: 1,
    title: 'test title',
    link: 'https://example.com/test',
    pubDate: new Date(),
    imageUrl: 'https://example.com/image.jpg',
    summary: '',
  };
  let rssInformation = {};

  beforeAll(async () => {
    claudeService = new ClaudeService(
      testContext.tagMapRepository,
      testContext.feedRepository,
      testContext.redisConnection,
    );
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('피드의 데이터가 있을 경우 올바른 요약과 알맞은 태그를 받았을 경우 데이터 저장을 성공한다.', async () => {
    jest
      .spyOn(claudeService as any, 'loadFeeds')
      .mockResolvedValue(feedInformation);

    // given
    await testContext.dbConnection.executeQuery(
      `INSERT INTO feed (blog_id, pub_date, title, link, image_url)
      `,
      [
        feedInformation.blogId,
        feedInformation.pubDate,
        feedInformation.title,
        feedInformation.link,
        feedInformation.imageUrl,
        feedInformation.summary,
      ],
    );
    // when
    // then
  });

  it('피드의 데이터를 요약하고 태그를 받아왔을 떄, 태그가 DB 목록에 없다.', async () => {
    // given
    // when
    // then
  });

  it('피드의 데이터를 요약하고 요약한 내용을 받아왔을 때, 요약 내용이 없다.', async () => {
    // given
    // when
    // then
  });
});
