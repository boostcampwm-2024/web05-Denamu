import { HttpStatus, INestApplication } from '@nestjs/common';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { UserFixture } from '../../fixture/user.fixture';
import { RssAcceptFixture } from '../../fixture/rss-accept.fixture';
import { FeedFixture } from '../../fixture/feed.fixture';
import { User } from '../../../src/user/entity/user.entity';
import { Feed } from '../../../src/feed/entity/feed.entity';
import { ManageLikeRequestDto } from '../../../src/like/dto/request/manageLike.dto';
import * as supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { LikeRepository } from '../../../src/like/repository/like.repository';
import { createAccessToken } from '../../jest.setup';

const URL = '/api/like';

describe(`POST ${URL} E2E Test`, () => {
  let app: INestApplication;
  let user: User;
  let feed: Feed;
  let agent: TestAgent;
  let likeRepository: LikeRepository;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    const userRepository = app.get(UserRepository);
    const rssAcceptRepository = app.get(RssAcceptRepository);
    const feedRepository = app.get(FeedRepository);
    const rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    likeRepository = app.get(LikeRepository);
    [user, feed] = await Promise.all([
      userRepository.save(await UserFixture.createUserCryptFixture()),
      feedRepository.save(FeedFixture.createFeedFixture(rssAccept)),
    ]);
  });

  it('[401] 로그인이 되어 있지 않을 경우 좋아요 등록을 실패한다.', async () => {
    // given
    const requestDto = new ManageLikeRequestDto({
      feedId: feed.id,
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedLike = await likeRepository.findOneBy({
      feed: { id: requestDto.feedId },
      user: { id: user.id },
    });

    // DB, Redis then
    expect(savedLike).toBeNull();
  });

  it('[404] 게시글이 서비스에 존재하지 않을 경우 좋아요 등록을 실패한다.', async () => {
    // given
    const requestDto = new ManageLikeRequestDto({
      feedId: Number.MAX_SAFE_INTEGER,
    });
    const accessToken = createAccessToken(user);

    // Http when
    const response = await agent
      .post(URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedLike = await likeRepository.findOneBy({
      feed: { id: requestDto.feedId },
      user: { id: user.id },
    });

    // DB, Redis then
    expect(savedLike).toBeNull();
  });

  it('[409] 이미 좋아요를 한 게시글일 경우 좋아요 등록을 실패한다.', async () => {
    // given
    const like = await likeRepository.save({
      user,
      feed,
    });
    const requestDto = new ManageLikeRequestDto({
      feedId: feed.id,
    });
    const accessToken = createAccessToken(user);

    // Http when
    const response = await agent
      .post(URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.CONFLICT);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedLike = await likeRepository.findBy({
      feed: { id: requestDto.feedId },
      user: { id: user.id },
    });

    // DB, Redis then
    expect(savedLike.length).toBe(1);

    // cleanup
    await likeRepository.delete({ id: like.id });
  });

  it('[201] 로그인이 되어 있으며 좋아요를 한 적이 없을 경우 좋아요 등록을 성공한다.', async () => {
    // given
    const requestDto = new ManageLikeRequestDto({
      feedId: feed.id,
    });
    const accessToken = createAccessToken(user);

    // Http when
    const response = await agent
      .post(URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedLike = await likeRepository.findOneBy({
      feed: { id: requestDto.feedId },
      user: { id: user.id },
    });

    // DB, Redis then
    expect(savedLike).not.toBeNull();

    // cleanup
    await likeRepository.delete({
      user: { id: user.id },
      feed: { id: feed.id },
    });
  });
});
