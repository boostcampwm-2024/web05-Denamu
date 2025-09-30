import { HttpStatus, INestApplication } from '@nestjs/common';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import { FeedFixture } from '../../fixture/feed.fixture';
import { RssAcceptFixture } from '../../fixture/rss-accept.fixture';
import { Feed } from '../../../src/feed/entity/feed.entity';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { UserFixture } from '../../fixture/user.fixture';
import * as request from 'supertest';

describe('DELETE /api/feed/{feedId} E2E Test', () => {
  let app: INestApplication;
  let feed: Feed;

  beforeAll(async () => {
    app = global.testApp;

    const userRepository = app.get(UserRepository);
    const rssAcceptRepository = app.get(RssAcceptRepository);
    const feedRepository = app.get(FeedRepository);

    await userRepository.save(await UserFixture.createUserCryptFixture());
    const rssAcceptInformation = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    feed = await feedRepository.save(
      FeedFixture.createFeedFixture(rssAcceptInformation),
    );
  });

  it('[200] 원본 게시글이 존재할 경우 200을 반환한다.', async () => {
    // given
    global.fetch = jest.fn().mockResolvedValue({ status: HttpStatus.OK });

    // when
    const response = await request(app.getHttpServer()).delete(
      `/api/feed/${feed.id}`,
    );

    // then
    expect(response.status).toBe(HttpStatus.OK);
  });

  it('[404] 원본 게시글이 존재하지 않을 경우 데나무 서비스에서 삭제하고 404를 반환한다.', async () => {
    // given
    global.fetch = jest
      .fn()
      .mockResolvedValue({ status: HttpStatus.NOT_FOUND });

    // when
    const response = await request(app.getHttpServer()).delete(
      `/api/feed/${feed.id}`,
    );

    // then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[404] 존재하지 않는 게시글 ID에 요청을 보낼 경우 404를 응답한다.', async () => {
    // when
    const response = await request(app.getHttpServer()).delete(
      `/api/feed/${feed.id}`,
    );

    // then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });
});
