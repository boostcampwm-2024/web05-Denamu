import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { UserBlockRepository } from '@block/repository/userBlock.repository';

import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { createAccessToken, testApp } from '@test/config/e2e/env/jest.setup';

const BASE_URL = '/api/blocks/user';

describe(`DELETE ${BASE_URL}/:userId E2E Test`, () => {
  let agent: TestAgent;
  let blockRepository: UserBlockRepository;
  let userRepository: UserRepository;
  let blocker: User;
  let target: User;
  let accessToken: string;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    blockRepository = testApp.get(UserBlockRepository);
    userRepository = testApp.get(UserRepository);
  });

  beforeEach(async () => {
    [blocker, target] = await Promise.all([
      userRepository.save(await UserFixture.createUserCryptFixture()),
      userRepository.save(UserFixture.createUserFixture()),
    ]);
    accessToken = createAccessToken(blocker);
  });

  it('[401] 로그인이 되어 있지 않을 경우 차단 해제를 실패한다.', async () => {
    // given
    await blockRepository.save({
      blocker: { id: blocker.id },
      blocked: { id: target.id },
    });

    // Http when
    const response = await agent.delete(`${BASE_URL}/${target.id}`);

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
    expect(savedBlock).not.toBeNull();
  });

  it('[404] 차단하지 않은 유저를 해제할 경우 실패한다.', async () => {
    // Http when
    const response = await agent
      .delete(`${BASE_URL}/${target.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();
  });

  it('[200] 유저 차단 해제를 성공한다.', async () => {
    // given
    await blockRepository.save({
      blocker: { id: blocker.id },
      blocked: { id: target.id },
    });

    // Http when
    const response = await agent
      .delete(`${BASE_URL}/${target.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    expect(response.status).toBe(HttpStatus.OK);

    // DB when
    const savedBlock = await blockRepository.findOneBy({
      blocker: { id: blocker.id },
      blocked: { id: target.id },
    });

    // DB then
    expect(savedBlock).toBeNull();
  });

  it('[200] 차단 해제는 본인의 차단만 제거하고 다른 유저의 차단은 유지한다.', async () => {
    // given - 다른 유저도 같은 대상을 차단한 상태
    const otherBlocker = await userRepository.save(
      UserFixture.createUserFixture(),
    );
    await blockRepository.save([
      { blocker: { id: blocker.id }, blocked: { id: target.id } },
      { blocker: { id: otherBlocker.id }, blocked: { id: target.id } },
    ]);

    // Http when
    const response = await agent
      .delete(`${BASE_URL}/${target.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    expect(response.status).toBe(HttpStatus.OK);

    // DB when
    const otherBlock = await blockRepository.findOneBy({
      blocker: { id: otherBlocker.id },
      blocked: { id: target.id },
    });

    // DB then
    expect(otherBlock).not.toBeNull();
  });
});
