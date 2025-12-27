import { HttpStatus } from '@nestjs/common';
import { FeedFixture } from '../../config/common/fixture/feed.fixture';
import { RssAcceptFixture } from '../../config/common/fixture/rss-accept.fixture';
import { Feed } from '../../../src/feed/entity/feed.entity';
import { RssAccept } from '../../../src/rss/entity/rss.entity';
import { FeedE2EHelper } from '../../config/common/helper/feed/feed-helper';

const URL = '/api/feed';

describe(`DELETE ${URL}/{feedId} E2E Test`, () => {
  const { agent, feedRepository, rssAcceptRepository } = new FeedE2EHelper();
  let feed: Feed;
  let rssAccept: RssAccept;

  beforeEach(async () => {
    rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    feed = await feedRepository.save(FeedFixture.createFeedFixture(rssAccept));
  });

  afterEach(async () => {
    await feedRepository.delete(feed.id);
    await rssAcceptRepository.delete(rssAccept.id);
  });

  it('[404] 존재하지 않는 게시글 ID에 요청을 보낼 경우 404를 응답한다.', async () => {
    // Http when
    const response = await agent.delete(`${URL}/${Number.MAX_SAFE_INTEGER}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedFeed = await feedRepository.findOneBy({
      id: feed.id,
    });

    // DB, Redis then
    expect(savedFeed).not.toBeNull();
  });

  it('[404] 원본 게시글이 존재하지 않을 경우 서비스에서 게시글 정보를 삭제하여 조회를 실패한다.', async () => {
    // given
    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: false, status: HttpStatus.NOT_FOUND });

    // Http when
    const response = await agent.delete(`${URL}/${feed.id}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedFeed = await feedRepository.findOneBy({
      id: feed.id,
    });

    // DB, Redis then
    expect(savedFeed).toBeNull();
  });

  it('[200] 원본 게시글이 존재할 경우 조회를 성공한다.', async () => {
    // given
    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: true, status: HttpStatus.OK });

    // Http when
    const response = await agent.delete(`${URL}/${feed.id}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedFeed = await feedRepository.findOneBy({ id: feed.id });

    // DB, Redis then
    expect(savedFeed).not.toBeNull();
  });
});
