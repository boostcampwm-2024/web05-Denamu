import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { BlockRepository } from '@block/repository/block.repository';

import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { createAccessToken, testApp } from '@test/config/e2e/env/jest.setup';

const BASE_URL = '/api/blocks';

describe(`GET ${BASE_URL} E2E Test`, () => {
  let agent: TestAgent;
  let blockRepository: BlockRepository;
  let userRepository: UserRepository;
  let blocker: User;
  let accessToken: string;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    blockRepository = testApp.get(BlockRepository);
    userRepository = testApp.get(UserRepository);
  });

  beforeEach(async () => {
    blocker = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
    accessToken = createAccessToken(blocker);
  });

  it('[401] 로그인이 되어 있지 않을 경우 차단 목록 조회를 실패한다.', async () => {
    // Http when
    const response = await agent.get(BASE_URL);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();
  });

  it('[200] 차단한 유저가 없으면 빈 배열을 반환한다.', async () => {
    // Http when
    const response = await agent
      .get(BASE_URL)
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual([]);
  });

  it('[200] 본인이 차단한 유저 목록만 최신순으로 반환한다.', async () => {
    // given - 본인이 2명 차단, 다른 유저가 1명 차단
    const [targetA, targetB, otherBlocker, otherTarget] = await Promise.all([
      userRepository.save(
        UserFixture.createUserFixture({ userName: '차단대상A' }),
      ),
      userRepository.save(
        UserFixture.createUserFixture({
          userName: '차단대상B',
          profileImage:
            'https://denamu.dev/objects/PROFILE_IMAGE/20250816/uuid.png',
        }),
      ),
      userRepository.save(UserFixture.createUserFixture()),
      userRepository.save(UserFixture.createUserFixture()),
    ]);
    await blockRepository.save({
      blocker: { id: blocker.id },
      blocked: { id: targetA.id },
    });
    await blockRepository.save({
      blocker: { id: blocker.id },
      blocked: { id: targetB.id },
    });
    await blockRepository.save({
      blocker: { id: otherBlocker.id },
      blocked: { id: otherTarget.id },
    });

    // Http when
    const response = await agent
      .get(BASE_URL)
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    const { data } = response.body as {
      data: {
        userId: number;
        userName: string;
        profileImage: string | null;
        blockedAt: string;
      }[];
    };
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toHaveLength(2);
    expect(data.map((item) => item.userId)).toStrictEqual([
      targetB.id,
      targetA.id,
    ]);
    expect(data[0]).toMatchObject({
      userId: targetB.id,
      userName: targetB.userName,
      profileImage: targetB.profileImage,
    });
    expect(data[0].blockedAt).toBeDefined();
  });
});
