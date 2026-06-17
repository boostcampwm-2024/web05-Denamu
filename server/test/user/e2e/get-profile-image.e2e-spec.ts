import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = (id: number | string) => `/api/users/${id}/profile-image`;

describe(`GET /api/users/:id/profile-image E2E Test`, () => {
  let agent: TestAgent;
  let userRepository: UserRepository;
  let user: User;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    userRepository = testApp.get(UserRepository);
  });

  beforeEach(async () => {
    user = await userRepository.save(
      UserFixture.createUserFixture({
        profileImage:
          'https://denamu.dev/objects/PROFILE_IMAGE/20250816/uuid.png',
      }),
    );
  });

  it('[200] 프로필 이미지가 설정된 유저를 조회하면 이미지 URL을 반환한다.', async () => {
    // Http when
    const response = await agent.get(URL(user.id));

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({ profileImage: user.profileImage });
  });

  it('[200] 프로필 이미지가 미설정인 유저를 조회하면 null을 반환한다.', async () => {
    // given
    const noImageUser = await userRepository.save(
      UserFixture.createUserFixture({ profileImage: null }),
    );

    // Http when
    const response = await agent.get(URL(noImageUser.id));

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({ profileImage: null });
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
