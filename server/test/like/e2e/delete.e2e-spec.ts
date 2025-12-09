import { HttpStatus, INestApplication } from '@nestjs/common';
import { UserService } from '../../../src/user/service/user.service';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { UserFixture } from '../../fixture/user.fixture';
import { RssAcceptFixture } from '../../fixture/rss-accept.fixture';
import { FeedFixture } from '../../fixture/feed.fixture';
import { RssAccept } from '../../../src/rss/entity/rss.entity';
import { User } from '../../../src/user/entity/user.entity';
import { Feed } from '../../../src/feed/entity/feed.entity';
import { ManageLikeRequestDto } from '../../../src/like/dto/request/manageLike.dto';
import * as supertest from 'supertest';
import { LikeRepository } from '../../../src/like/repository/like.repository';
import TestAgent from 'supertest/lib/agent';

const URL = '/api/like';

describe(`DELETE ${URL}/{feedId} E2E Test`, () => {
  let app: INestApplication;
  let rssAccept: RssAccept;
  let user: User;
  let feed: Feed;
  let agent: TestAgent;
  let likeRepository: LikeRepository;
  let createAccessToken: (arg0?: number) => string;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    likeRepository = app.get(LikeRepository);
    const userService = app.get(UserService);
    const userRepository = app.get(UserRepository);
    const rssAcceptRepository = app.get(RssAcceptRepository);
    const feedRepository = app.get(FeedRepository);

    user = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
    rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    feed = await feedRepository.save(FeedFixture.createFeedFixture(rssAccept));
    createAccessToken = (notFoundId?: number) =>
      userService.createToken(
        {
          id: notFoundId ?? user.id,
          email: user.email,
          userName: user.userName,
          role: 'user',
        },
        'access',
      );
  });

  it('[401] 로그인이 되어 있지 않을 경우 좋아요 삭제를 실패한다.', async () => {
    // given
    const requestDto = new ManageLikeRequestDto({
      feedId: feed.id,
    });

    // Http when
    const response = await agent.delete(`${URL}/${requestDto.feedId}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();
  });

  it('[404] 피드가 존재하지 않을 경우 좋아요 삭제를 실패한다.', async () => {
    // given
    const requestDto = new ManageLikeRequestDto({
      feedId: Number.MAX_SAFE_INTEGER,
    });
    const accessToken = createAccessToken();

    // Http when
    const response = await agent
      .delete(`${URL}/${requestDto.feedId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();
  });

  it('[404] 좋아요를 안 했을 경우 좋아요 삭제를 실패한다.', async () => {
    // given
    const requestDto = new ManageLikeRequestDto({
      feedId: feed.id,
    });
    const accessToken = createAccessToken();

    // Http when
    const response = await agent
      .delete(`${URL}/${requestDto.feedId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();
  });

  it('[200] 로그인이 되어 있고 좋아요를 한 경우 좋아요 삭제를 성공한다.', async () => {
    // given
    await likeRepository.save({
      feed,
      user,
      likeDate: new Date(),
    });
    const requestDto = new ManageLikeRequestDto({
      feedId: feed.id,
    });
    const accessToken = createAccessToken();

    // Http when
    const response = await agent
      .delete(`${URL}/${requestDto.feedId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedLike = await likeRepository.findOneBy({
      feed: { id: requestDto.feedId },
      user,
    });

    // DB, Redis then
    expect(savedLike).toBeNull();
  });
});
