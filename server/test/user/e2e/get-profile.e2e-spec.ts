import { HttpStatus } from '@nestjs/common';

import { BlockRepository } from '@block/repository/block.repository';
import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { GetUserProfileResponseDto } from '@user/dto/response/getUserProfile.dto';
import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { createAccessToken, testApp } from '@test/config/e2e/env/jest.setup';

const URL = (id: number | string) => `/api/users/${id}/profile`;

describe(`GET /api/users/:id/profile E2E Test`, () => {
  let agent: TestAgent;
  let userRepository: UserRepository;
  let blockRepository: BlockRepository;
  let user: User;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    userRepository = testApp.get(UserRepository);
    blockRepository = testApp.get(BlockRepository);
  });

  beforeEach(async () => {
    user = await userRepository.save(
      UserFixture.createUserFixture({
        userName: '김개발',
        profileImage:
          'https://denamu.dev/objects/PROFILE_IMAGE/20250816/uuid.png',
        introduction: '안녕하세요! 김개발입니다.',
        maxStreak: 15,
        currentStreak: 7,
        totalViews: 120,
      }),
    );
  });

  it('[200] 프로필이 설정된 유저를 조회하면 이름·이미지·소개와 스트릭 통계를 반환한다.', async () => {
    // Http when
    const response = await agent.get(URL(user.id));

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({
      userName: user.userName,
      profileImage: user.profileImage,
      introduction: user.introduction,
      maxStreak: user.maxStreak,
      currentStreak: user.currentStreak,
      totalViews: user.totalViews,
      isBlocked: false,
    });
  });

  it('[200] 이미지·소개가 미설정인 유저를 조회하면 해당 필드를 null로 반환한다.', async () => {
    // given
    const minimalUser = await userRepository.save(
      UserFixture.createUserFixture({
        userName: '최소정보',
        profileImage: null,
        introduction: null,
      }),
    );

    // Http when
    const response = await agent.get(URL(minimalUser.id));

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({
      userName: minimalUser.userName,
      profileImage: null,
      introduction: null,
      maxStreak: minimalUser.maxStreak,
      currentStreak: minimalUser.currentStreak,
      totalViews: minimalUser.totalViews,
      isBlocked: false,
    });
  });

  it('[200] 차단한 유저의 프로필을 조회하면 isBlocked가 true로 반환된다.', async () => {
    // given
    const viewer = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
    await blockRepository.save({
      blocker: { id: viewer.id },
      blocked: { id: user.id },
    });
    const accessToken = createAccessToken(viewer);

    // Http when
    const response = await agent
      .get(URL(user.id))
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    const { data }: { data: GetUserProfileResponseDto } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.isBlocked).toBe(true);
  });

  it('[200] 차단당한 유저가 차단한 유저의 프로필을 조회하면 isBlocked가 false로 반환된다.', async () => {
    // given - 차단은 단방향이므로 반대 방향 조회에는 영향이 없다
    const viewer = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
    await blockRepository.save({
      blocker: { id: user.id },
      blocked: { id: viewer.id },
    });
    const accessToken = createAccessToken(viewer);

    // Http when
    const response = await agent
      .get(URL(user.id))
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    const { data }: { data: GetUserProfileResponseDto } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.isBlocked).toBe(false);
  });

  it('[404] 존재하지 않는 유저를 조회하면 실패한다.', async () => {
    // Http when
    const response = await agent.get(URL(Number.MAX_SAFE_INTEGER));

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();
  });

  it('[400] id가 숫자가 아니면 검증에 실패한다.', async () => {
    // Http when
    const response = await agent.get(URL('not-a-number'));

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(data).toBeUndefined();
  });
});
