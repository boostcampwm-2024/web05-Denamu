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
  let rssAccept: RssAccept;
  let feed: Feed;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    const userRepository = app.get(UserRepository);
    const rssAcceptRepository = app.get(RssAcceptRepository);
    const feedRepository = app.get(FeedRepository);

    await userRepository.save(await UserFixture.createUserCryptFixture());
    rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    feed = await feedRepository.save(FeedFixture.createFeedFixture(rssAccept));
  });

  it('[200] 게시글에 대한 좋아요 조회 요청을 받을 경우 좋아요 정보 제공을 성공한다.', async () => {
    // when
    const response = await agent.get(`/api/like/${feed.id}`);

    // then
    expect(response.status).toBe(HttpStatus.OK);
  });

  it('[404] 게시글이 존재하지 않을 경우 좋아요 정보 제공을 실패한다.', async () => {
    // when
    const response = await agent.get(`/api/like/${Number.MAX_SAFE_INTEGER}`);

    // then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });
});
