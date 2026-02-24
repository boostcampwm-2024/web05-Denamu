import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { CommentRepository } from '@comment/repository/comment.repository';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { Feed } from '@feed/entity/feed.entity';
import { FeedRepository } from '@feed/repository/feed.repository';

import { LikeRepository } from '@like/repository/like.repository';

import { Rss, RssAccept } from '@rss/entity/rss.entity';
import {
  RssAcceptRepository,
  RssRepository,
} from '@rss/repository/rss.repository';

import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { CommentFixture } from '@test/config/common/fixture/comment.fixture';
import { FeedFixture } from '@test/config/common/fixture/feed.fixture';
import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { RssFixture } from '@test/config/common/fixture/rss.fixture';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/rss/remove';

describe(`DELETE ${URL}/{code} E2E Test`, () => {
  let agent: TestAgent;
  let feedRepository: FeedRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let redisService: RedisService;
  let commentRepository: CommentRepository;
  let userRepository: UserRepository;
  let likeRepository: LikeRepository;
  let rssRepository: RssRepository;
  let rssAccept: RssAccept;
  let feed: Feed;
  let user: User;
  let rss: Rss;
  const redisKeyMake = (data: string) => `${REDIS_KEYS.RSS_REMOVE_KEY}:${data}`;
  const rssDeleteCode = 'rss-remove-certificate';

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    rssAcceptRepository = testApp.get(RssAcceptRepository);
    rssRepository = testApp.get(RssRepository);
    redisService = testApp.get(RedisService);
    feedRepository = testApp.get(FeedRepository);
    commentRepository = testApp.get(CommentRepository);
    userRepository = testApp.get(UserRepository);
    likeRepository = testApp.get(LikeRepository);
  });

  beforeEach(async () => {
    [rss, rssAccept] = await Promise.all([
      rssRepository.save(RssFixture.createRssFixture()),
      rssAcceptRepository.save(RssAcceptFixture.createRssAcceptFixture()),
    ]);
    [user, feed] = await Promise.all([
      userRepository.save(await UserFixture.createUserCryptFixture()),
      feedRepository.save(FeedFixture.createFeedFixture(rssAccept)),
    ]);
    await commentRepository.insert(
      CommentFixture.createCommentFixture(feed, user),
    );
  });

  it('[404] RSS 삭제 요청이 만료되었거나 없을 경우 RSS 삭제 인증을 실패한다.', async () => {
    // Http when
    const response = await agent.delete(`${URL}/Wrong${rssDeleteCode}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedRssRemoveURL = await redisService.get(
      redisKeyMake(rssDeleteCode),
    );

    // DB, Redis then
    expect(savedRssRemoveURL).toBeNull();
  });

  it('[200] 삭제 신청된 RSS가 승인된 RSS에 있을 경우 승인된 RSS와 관련된 모든 데이터들의 삭제를 성공한다.', async () => {
    // given
    await redisService.set(redisKeyMake(rssDeleteCode), rssAccept.rssUrl);

    // Http when
    const response = await agent.delete(`${URL}/${rssDeleteCode}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();

    // DB, Redis when
    const [
      savedRssAccept,
      savedFeed,
      savedComment,
      savedLike,
      savedRssRemoveURL,
    ] = await Promise.all([
      rssAcceptRepository.findOneBy({
        rssUrl: rssAccept.rssUrl,
      }),
      feedRepository.findBy({ blog: rssAccept }),
      commentRepository.findBy({
        feed: { id: feed.id },
      }),
      likeRepository.findBy({ feed: { id: feed.id } }),
      redisService.get(redisKeyMake(rssDeleteCode)),
    ]);

    // DB, Redis then
    expect(savedRssAccept).toBeNull();
    expect(savedFeed.length).toBe(0);
    expect(savedComment.length).toBe(0);
    expect(savedLike.length).toBe(0);
    expect(savedRssRemoveURL).toBeNull();
  });

  it('[200] 삭제 신청된 RSS가 대기중인 RSS에 있을 경우 대기중인 RSS 데이터 삭제를 성공한다.', async () => {
    // given
    await redisService.set(redisKeyMake(rssDeleteCode), rss.rssUrl);

    // Http when
    const response = await agent.delete(`${URL}/${rssDeleteCode}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();

    // DB, Redis when
    const [savedRss, savedRssRemoveURL] = await Promise.all([
      rssRepository.findOneBy({
        rssUrl: rss.rssUrl,
      }),
      redisService.get(redisKeyMake(rssDeleteCode)),
    ]);

    // DB, Redis then
    expect(savedRss).toBeNull();
    expect(savedRssRemoveURL).toBeNull();
  });

  it('[404] 이미 삭제된 RSS에 대해 삭제 인증 요청 시 실패한다.', async () => {
    // given - 존재하지 않는 RSS URL로 Redis에 삭제 코드 등록
    const nonExistentRssUrl = 'https://deleted-blog.com/rss';
    await redisService.set(redisKeyMake(rssDeleteCode), nonExistentRssUrl);

    // Http when
    const response = await agent.delete(`${URL}/${rssDeleteCode}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();

    // DB, Redis when - Redis 키는 삭제되어야 함
    const savedRssRemoveURL = await redisService.get(
      redisKeyMake(rssDeleteCode),
    );

    // DB, Redis then
    expect(savedRssRemoveURL).toBeNull();
  });
});
