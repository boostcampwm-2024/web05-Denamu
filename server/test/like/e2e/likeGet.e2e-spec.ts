import { INestApplication } from '@nestjs/common';
import { UserService } from '../../../src/user/service/user.service';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { UserFixture } from '../../fixture/user.fixture';
import { RssAcceptFixture } from '../../fixture/rssAccept.fixture';
import { FeedFixture } from '../../fixture/feed.fixture';
import { RssAccept } from '../../../src/rss/entity/rss.entity';
import { User } from '../../../src/user/entity/user.entity';
import { Feed } from '../../../src/feed/entity/feed.entity';
import * as request from 'supertest';

describe('GET /api/like/{feedId} E2E Test', () => {
  let app: INestApplication;
  let userService: UserService;
  let rssAcceptInformation: RssAccept;
  let userInformation: User;
  let feed: Feed;

  beforeAll(async () => {
    app = global.testApp;
    userService = app.get(UserService);
    const userRepository = app.get(UserRepository);
    const rssAcceptRepository = app.get(RssAcceptRepository);
    const feedRepository = app.get(FeedRepository);

    userInformation = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
    rssAcceptInformation = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    feed = await feedRepository.save(
      FeedFixture.createFeedFixture(rssAcceptInformation),
    );
  });

  it('[200] 좋아요 조회를 할 수 있다.', async () => {
    // given
    const agent = request.agent(app.getHttpServer());

    // when
    const response = await agent.get(`/api/like/${feed.id}`).send();

    // then
    expect(response.status).toBe(200);
  });

  it('[404] 게시글이 없다면 좋아요 조회를 할 수 없다.', async () => {
    // given
    const agent = request.agent(app.getHttpServer());

    // when
    const response = await agent.get(`/api/like/100`).send();

    // then
    expect(response.status).toBe(404);
  });
});
