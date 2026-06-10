import { HttpStatus } from '@nestjs/common';

import * as uuid from 'uuid';
import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { ActivityRepository } from '@activity/repository/activity.repository';

import { CommentRepository } from '@comment/repository/comment.repository';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { Feed } from '@feed/entity/feed.entity';
import { FeedRepository } from '@feed/repository/feed.repository';

import { FileRepository } from '@file/repository/file.repository';

import { LikeRepository } from '@like/repository/like.repository';

import { RssAccept } from '@rss/entity/rss.entity';
import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { CommentFixture } from '@test/config/common/fixture/comment.fixture';
import { FeedFixture } from '@test/config/common/fixture/feed.fixture';
import { FileFixture } from '@test/config/common/fixture/file.fixture';
import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const makeURL = (token: string) => `/api/users/deletion-requests/${token}`;

describe(`DELETE /api/users/deletion-requests/:token E2E Test`, () => {
  let agent: TestAgent;
  let redisService: RedisService;
  let userRepository: UserRepository;
  let commentRepository: CommentRepository;
  let likeRepository: LikeRepository;
  let activityRepository: ActivityRepository;
  let fileRepository: FileRepository;
  let feedRepository: FeedRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let user: User;
  let rssAccept: RssAccept;
  let feed: Feed;
  const userDeleteCode = uuid.v4();
  const redisKeyMake = (data: string) =>
    `${REDIS_KEYS.USER_DELETE_ACCOUNT_KEY}:${data}`;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    redisService = testApp.get(RedisService);
    userRepository = testApp.get(UserRepository);
    feedRepository = testApp.get(FeedRepository);
    rssAcceptRepository = testApp.get(RssAcceptRepository);
    commentRepository = testApp.get(CommentRepository);
    likeRepository = testApp.get(LikeRepository);
    activityRepository = testApp.get(ActivityRepository);
    fileRepository = testApp.get(FileRepository);
  });

  beforeEach(async () => {
    rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    [user, feed] = await Promise.all([
      userRepository.save(await UserFixture.createUserCryptFixture()),
      feedRepository.save(FeedFixture.createFeedFixture(rssAccept)),
    ]);
    await Promise.all([
      commentRepository.insert(CommentFixture.createCommentFixture(feed, user)),
      likeRepository.insert({ feed, user }),
      fileRepository.insert(FileFixture.createFileFixture(user)),
      redisService.set(redisKeyMake(userDeleteCode), user.id),
    ]);
  });

  it('[404] 회원 탈퇴 인증 코드가 만료되었거나 잘 못된 경우 회원 탈퇴를 실패한다.', async () => {
    // given
    const nonExistentCode = uuid.v4();

    // Http when
    const response = await agent.delete(makeURL(nonExistentCode));

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();

    // DB, Redis when
    const [savedUser, savedDeleteCode] = await Promise.all([
      userRepository.findOneBy({ id: user.id }),
      redisService.get(redisKeyMake(nonExistentCode)),
    ]);

    // DB, Redis then
    expect(savedUser).not.toBeNull();
    expect(savedDeleteCode).toBeNull();
  });

  it('[200] 회원 탈퇴 인증 코드가 있을 경우 회원 탈퇴를 성공한다.', async () => {
    // given
    const user = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );

    await redisService.set(redisKeyMake(userDeleteCode), user.id.toString());

    // Http when
    const response = await agent.delete(makeURL(userDeleteCode));

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();

    // DB, Redis when
    const [
      savedUser,
      savedUserDeleteCode,
      savedLikes,
      savedComments,
      savedActivities,
      savedFiles,
      invalidatedUser,
    ] = await Promise.all([
      userRepository.findOneBy({ id: user.id }),
      redisService.get(redisKeyMake(userDeleteCode)),
      likeRepository.findBy({ user: { id: user.id } }),
      commentRepository.findBy({ user: { id: user.id } }),
      activityRepository.findBy({ user: { id: user.id } }),
      fileRepository.findBy({ user: { id: user.id } }),
      redisService.get(`${REDIS_KEYS.USER_INVALIDATED_PREFIX}:${user.id}`),
    ]);

    // DB, Redis then
    expect(savedUser).toBeNull();
    expect(savedUserDeleteCode).toBeNull();
    expect(savedLikes.length).toBe(0);
    expect(savedComments.length).toBe(0);
    expect(savedActivities.length).toBe(0);
    expect(savedFiles.length).toBe(0);
    expect(Number(invalidatedUser)).toBeGreaterThan(0);
  });
});
