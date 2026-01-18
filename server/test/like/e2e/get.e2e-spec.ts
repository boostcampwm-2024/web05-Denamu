import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { Feed } from '@feed/entity/feed.entity';
import { FeedRepository } from '@feed/repository/feed.repository';

import { LikeRepository } from '@like/repository/like.repository';

import { RssAccept } from '@rss/entity/rss.entity';
import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { FeedFixture } from '@test/config/common/fixture/feed.fixture';
import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { createAccessToken } from '@test/config/e2e/env/jest.setup';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/like';

describe(`GET ${URL}/{feedId} E2E Test`, () => {
  let agent: TestAgent;
  let feed: Feed;
  let user: User;
  let userRepository: UserRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let feedRepository: FeedRepository;
  let likeRepository: LikeRepository;
  let rssAccept: RssAccept;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    userRepository = testApp.get(UserRepository);
    rssAcceptRepository = testApp.get(RssAcceptRepository);
    feedRepository = testApp.get(FeedRepository);
    likeRepository = testApp.get(LikeRepository);
  });

  beforeEach(async () => {
    rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    [user, feed] = await Promise.all([
      userRepository.save(await UserFixture.createUserCryptFixture()),
      feedRepository.save(FeedFixture.createFeedFixture(rssAccept)),
    ]);
    await likeRepository.insert({ user, feed });
  });

  it('[404] 게시글이 존재하지 않을 경우 좋아요 정보 제공을 실패한다.', async () => {
    // Http when
    const response = await agent.get(`${URL}/${Number.MAX_SAFE_INTEGER}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();
  });

  it('[200] 로그인하지 않은 상황에서 게시글에 대한 좋아요 조회 요청을 받을 경우 좋아요 정보 제공을 성공한다.', async () => {
    // Http when
    const response = await agent.get(`${URL}/${feed.id}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({
      isLike: false,
    });
  });

  it('[200] 로그인한 상황에서 게시글에 대한 좋아요 조회 요청을 받을 경우 좋아요 정보 제공을 성공한다.', async () => {
    // given
    const accessToken = createAccessToken(user);

    // Http when
    const response = await agent
      .get(`${URL}/${feed.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({
      isLike: true,
    });
  });
});
