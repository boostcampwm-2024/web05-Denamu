import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { UserRepository } from '../../../../src/user/repository/user.repository';
import { RedisService } from '../../../../src/common/redis/redis.service';
import { UserFixture } from '../../../config/common/fixture/user.fixture';
import { REDIS_KEYS } from '../../../../src/common/redis/redis.constant';
import { ConfirmDeleteAccountDto } from '../../../../src/user/dto/request/confirmDeleteAccount.dto';
import TestAgent from 'supertest/lib/agent';
import { CommentRepository } from '../../../../src/comment/repository/comment.repository';
import { LikeRepository } from '../../../../src/like/repository/like.repository';
import { ActivityRepository } from '../../../../src/activity/repository/activity.repository';
import { FileRepository } from '../../../../src/file/repository/file.repository';
import { User } from '../../../../src/user/entity/user.entity';
import { FeedRepository } from '../../../../src/feed/repository/feed.repository';
import { RssAcceptRepository } from '../../../../src/rss/repository/rss.repository';
import { RssAccept } from '../../../../src/rss/entity/rss.entity';
import { RssAcceptFixture } from '../../../config/common/fixture/rss-accept.fixture';
import { FeedFixture } from '../../../config/common/fixture/feed.fixture';
import { Feed } from '../../../../src/feed/entity/feed.entity';
import { Comment } from '../../../../src/comment/entity/comment.entity';
import { CommentFixture } from '../../../config/common/fixture/comment.fixture';
import { Like } from '../../../../src/like/entity/like.entity';
import { FileFixture } from '../../../config/common/fixture/file.fixture';
import { File } from '../../../../src/file/entity/file.entity';
import {
  createAccessToken,
  createRefreshToken,
} from '../../../config/e2e/env/jest.setup';

const URL = '/api/user/delete-account/confirm';

describe(`POST ${URL} E2E Test`, () => {
  let app: INestApplication;
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
  let comment: Comment;
  let like: Like;
  let file: File;
  const userDeleteCode = 'user-delete-confirm';
  const redisKeyMake = (data: string) =>
    `${REDIS_KEYS.USER_DELETE_ACCOUNT_KEY}:${data}`;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    redisService = app.get(RedisService);
    userRepository = app.get(UserRepository);
    feedRepository = app.get(FeedRepository);
    rssAcceptRepository = app.get(RssAcceptRepository);
    commentRepository = app.get(CommentRepository);
    likeRepository = app.get(LikeRepository);
    activityRepository = app.get(ActivityRepository);
    fileRepository = app.get(FileRepository);
  });

  beforeEach(async () => {
    rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    [user, feed] = await Promise.all([
      userRepository.save(await UserFixture.createUserCryptFixture()),
      feedRepository.save(FeedFixture.createFeedFixture(rssAccept)),
    ]);
    [comment, like, file] = await Promise.all([
      commentRepository.save(CommentFixture.createCommentFixture(feed, user)),
      likeRepository.save({ feed, user }),
      fileRepository.save(FileFixture.createFileFixture(user)),
      redisService.set(redisKeyMake(userDeleteCode), user.id),
    ]);
  });

  afterEach(async () => {
    await Promise.all([
      fileRepository.delete(file.id),
      likeRepository.delete(like.id),
      commentRepository.delete(comment.id),
      redisService.del(redisKeyMake(userDeleteCode)),
    ]);
    await Promise.all([
      feedRepository.delete(feed.id),
      userRepository.delete(user.id),
    ]);
    await rssAcceptRepository.delete(rssAccept.id);
  });

  it('[404] 회원 탈퇴 인증 코드가 만료되었거나 잘 못된 경우 회원 탈퇴를 실패한다.', async () => {
    // given
    const requestDto = new ConfirmDeleteAccountDto({
      token: `Wrong${userDeleteCode}`,
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();

    // DB, Redis when
    const [savedUser, savedDeleteCode] = await Promise.all([
      userRepository.findOneBy({ id: user.id }),
      redisService.get(redisKeyMake(userDeleteCode)),
    ]);

    // DB, Redis then
    expect(savedUser).not.toBeNull();
    expect(savedDeleteCode).toBe(user.id.toString());
  });

  it('[200] 회원 탈퇴 인증 코드가 있을 경우 회원 탈퇴를 성공한다.', async () => {
    // given
    const requestDto = new ConfirmDeleteAccountDto({ token: userDeleteCode });
    const user = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    await redisService.set(
      redisKeyMake(userDeleteCode),
      `${user.id}:${accessToken}:${refreshToken}`,
    );

    // Http when
    const response = await agent.post(URL).send(requestDto);

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
    ] = await Promise.all([
      userRepository.findOneBy({ id: user.id }),
      redisService.get(redisKeyMake(userDeleteCode)),
      likeRepository.findBy({ user: { id: user.id } }),
      commentRepository.findBy({
        user: { id: user.id },
      }),
      activityRepository.findBy({
        user: { id: user.id },
      }),
      fileRepository.findBy({ user: { id: user.id } }),
    ]);
    const blacklistedAccessToken = await redisService.get(
      `${REDIS_KEYS.USER_BLACKLIST_JWT_PREFIX}:${accessToken}`,
    );
    const blacklistedRefreshToken = await redisService.get(
      `${REDIS_KEYS.USER_BLACKLIST_JWT_PREFIX}:${refreshToken}`,
    );

    // DB, Redis then
    expect(savedUser).toBeNull();
    expect(savedUserDeleteCode).toBeNull();
    expect(savedLikes.length).toBe(0);
    expect(savedComments.length).toBe(0);
    expect(savedActivities.length).toBe(0);
    expect(savedFiles.length).toBe(0);
    expect(blacklistedAccessToken).toBe('1');
    expect(blacklistedRefreshToken).toBe('1');
  });
});
