import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { BlockRepository } from '@block/repository/block.repository';

import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { createAccessToken, testApp } from '@test/config/e2e/env/jest.setup';

const BASE_URL = '/api/blocks';

describe(`POST ${BASE_URL}/:userId E2E Test`, () => {
  let agent: TestAgent;
  let blockRepository: BlockRepository;
  let userRepository: UserRepository;
  let blocker: User;
  let target: User;
  let accessToken: string;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    blockRepository = testApp.get(BlockRepository);
    userRepository = testApp.get(UserRepository);
  });

  beforeEach(async () => {
    [blocker, target] = await Promise.all([
      userRepository.save(await UserFixture.createUserCryptFixture()),
      userRepository.save(UserFixture.createUserFixture()),
    ]);
    accessToken = createAccessToken(blocker);
  });

  it('[401] 로그인이 되어 있지 않을 경우 차단 등록을 실패한다.', async () => {
    // Http when
    const response = await agent.post(`${BASE_URL}/${target.id}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();

    // DB when
    const savedBlock = await blockRepository.findOneBy({
      blocker: { id: blocker.id },
      blocked: { id: target.id },
    });

    // DB then
    expect(savedBlock).toBeNull();
  });

  it('[400] 자기 자신을 차단할 경우 차단 등록을 실패한다.', async () => {
    // Http when
    const response = await agent
      .post(`${BASE_URL}/${blocker.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(data).toBeUndefined();
  });

  it('[404] 차단 대상 유저가 존재하지 않을 경우 차단 등록을 실패한다.', async () => {
    // Http when
    const response = await agent
      .post(`${BASE_URL}/${Number.MAX_SAFE_INTEGER}`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();
  });

  it('[409] 이미 차단한 유저를 다시 차단할 경우 실패한다.', async () => {
    // given
    await blockRepository.save({
      blocker: { id: blocker.id },
      blocked: { id: target.id },
    });

    // Http when
    const response = await agent
      .post(`${BASE_URL}/${target.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.CONFLICT);
    expect(data).toBeUndefined();
  });

  it('[201] 유저 차단 등록을 성공한다.', async () => {
    // Http when
    const response = await agent
      .post(`${BASE_URL}/${target.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    expect(response.status).toBe(HttpStatus.CREATED);

    // DB when
    const savedBlock = await blockRepository.findOneBy({
      blocker: { id: blocker.id },
      blocked: { id: target.id },
    });

    // DB then
    expect(savedBlock).not.toBeNull();
  });
});
