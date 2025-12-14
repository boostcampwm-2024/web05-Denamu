import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { UserRepository } from '../../../../src/user/repository/user.repository';
import { RedisService } from '../../../../src/common/redis/redis.service';
import { UserFixture } from '../../../config/fixture/user.fixture';
import { REDIS_KEYS } from '../../../../src/common/redis/redis.constant';
import { ConfirmDeleteAccountDto } from '../../../../src/user/dto/request/confirmDeleteAccount.dto';
import TestAgent from 'supertest/lib/agent';
import { CommentRepository } from '../../../../src/comment/repository/comment.repository';
import { LikeRepository } from '../../../../src/like/repository/like.repository';
import { ActivityRepository } from '../../../../src/activity/repository/activity.repository';
import { FileRepository } from '../../../../src/file/repository/file.repository';

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
  const userDeleteCode = 'user-delete-confirm';
  const redisKeyMake = (data: string) =>
    `${REDIS_KEYS.USER_DELETE_ACCOUNT_KEY}:${data}`;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    redisService = app.get(RedisService);
    userRepository = app.get(UserRepository);
    commentRepository = app.get(CommentRepository);
    likeRepository = app.get(LikeRepository);
    activityRepository = app.get(ActivityRepository);
    fileRepository = app.get(FileRepository);
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
  });

  it('[200] 회원 탈퇴 인증 코드가 있을 경우 회원 탈퇴를 성공한다.', async () => {
    // given
    const requestDto = new ConfirmDeleteAccountDto({ token: userDeleteCode });
    const user = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );

    await redisService.set(redisKeyMake(userDeleteCode), user.id);

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedComment = await commentRepository.findBy({
      user: { id: user.id },
    });
    const savedLike = await likeRepository.findBy({ user: { id: user.id } });
    const savedActivity = await activityRepository.findBy({
      user: { id: user.id },
    });
    const savedFile = await fileRepository.findBy({ user: { id: user.id } });
    const savedUserDeleteCode = await redisService.get(
      redisKeyMake(userDeleteCode),
    );

    // DB, Redis then
    expect(savedComment.length).toBe(0);
    expect(savedLike.length).toBe(0);
    expect(savedActivity.length).toBe(0);
    expect(savedFile.length).toBe(0);
    expect(savedUserDeleteCode).toBeNull();
  });
});
