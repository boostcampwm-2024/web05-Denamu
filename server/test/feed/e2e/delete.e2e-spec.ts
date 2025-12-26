import { HttpStatus, INestApplication } from '@nestjs/common';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import { FeedFixture } from '../../fixture/feed.fixture';
import { RssAcceptFixture } from '../../fixture/rss-accept.fixture';
import { Feed } from '../../../src/feed/entity/feed.entity';
import * as supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { RssAccept } from '../../../src/rss/entity/rss.entity';

const URL = '/api/feed';

describe(`DELETE ${URL}/{feedId} E2E Test`, () => {
  let app: INestApplication;
  let feed: Feed;
  let feedRepository: FeedRepository;
  let rssAccept: RssAccept;
  let agent: TestAgent;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    feedRepository = app.get(FeedRepository);
    const rssAcceptRepository = app.get(RssAcceptRepository);

    rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    feed = await feedRepository.save(FeedFixture.createFeedFixture(rssAccept));
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
    feed = await feedRepository.save(FeedFixture.createFeedFixture(rssAccept));
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

    // cleanup
    await feedRepository.delete(feed.id);
  });
});
