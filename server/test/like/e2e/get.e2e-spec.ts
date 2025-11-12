import { HttpStatus, INestApplication } from '@nestjs/common';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { UserFixture } from '../../fixture/user.fixture';
import { RssAcceptFixture } from '../../fixture/rss-accept.fixture';
import { FeedFixture } from '../../fixture/feed.fixture';
import { RssAccept } from '../../../src/rss/entity/rss.entity';
import { Feed } from '../../../src/feed/entity/feed.entity';
import * as supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

describe('GET /api/like/{feedId} E2E Test', () => {
  let app: INestApplication;
  let agent: TestAgent;
  let rssAcceptInformation: RssAccept;
  let feed: Feed;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    const userRepository = app.get(UserRepository);
    const rssAcceptRepository = app.get(RssAcceptRepository);
    const feedRepository = app.get(FeedRepository);

    await userRepository.save(await UserFixture.createUserCryptFixture());
    rssAcceptInformation = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    feed = await feedRepository.save(
      FeedFixture.createFeedFixture(rssAcceptInformation),
    );
  });

  it('[200] 좋아요 조회를 할 수 있다.', async () => {
    // when
    const response = await agent.get(`/api/like/${feed.id}`);

    // then
    expect(response.status).toBe(HttpStatus.OK);
  });

  it('[404] 게시글이 없다면 좋아요 조회를 할 수 없다.', async () => {
    // when
    const response = await agent.get(`/api/like/100`);

    // then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });
});
