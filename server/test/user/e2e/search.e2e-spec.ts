import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { UserBlockRepository } from '@block/repository/userBlock.repository';

import { UserSuspensionRepository } from '@suspension/repository/userSuspension.repository';

import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { createAccessToken, testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/users/search';

type SearchResponseBody = {
  data: {
    totalCount: number;
    totalPages: number;
    limit: number;
    result: { id: number; userName: string; profileImage: string | null }[];
  };
};

describe(`GET ${URL}?find={} E2E Test`, () => {
  let agent: TestAgent;
  let userRepository: UserRepository;
  let blockRepository: UserBlockRepository;
  let userSuspensionRepository: UserSuspensionRepository;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    userRepository = testApp.get(UserRepository);
    blockRepository = testApp.get(UserBlockRepository);
    userSuspensionRepository = testApp.get(UserSuspensionRepository);
  });

  const saveUser = (userName: string, overwrites: Partial<User> = {}) =>
    userRepository.save(
      UserFixture.createUserFixture({ userName, ...overwrites }),
    );

  it('[200] 닉네임이 부분 일치하는 유저를 모두 반환하고 관련도 순으로 정렬한다.', async () => {
    // given - 완전일치 > prefix(가나다) > 부분일치 순서를 검증한다.
    const exact = await saveUser('김');
    const prefixA = await saveUser('김가');
    const prefixB = await saveUser('김나');
    const contains = await saveUser('하김');
    await saveUser('박개발'); // '김' 미포함 → 결과 제외

    // when
    const response = await agent.get(URL).query({ find: '김' });

    // then
    const { data } = response.body as SearchResponseBody;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.totalCount).toBe(4);
    expect(data.totalPages).toBe(1);
    expect(data.limit).toBe(5);
    expect(data.result.map((user) => user.id)).toStrictEqual([
      exact.id,
      prefixA.id,
      prefixB.id,
      contains.id,
    ]);
  });

  it('[200] 검색 결과는 id, 닉네임, 프로필 이미지만 포함한다.', async () => {
    // given
    const user = await saveUser('프로필유저', {
      profileImage:
        'https://denamu.dev/objects/PROFILE_IMAGE/20250816/uuid.png',
    });

    // when
    const response = await agent.get(URL).query({ find: '프로필유저' });

    // then
    const { data } = response.body as SearchResponseBody;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.result).toStrictEqual([
      {
        id: user.id,
        userName: user.userName,
        profileImage: user.profileImage,
      },
    ]);
  });

  it('[200] 프로필 이미지가 없으면 null로 반환한다.', async () => {
    // given
    const user = await saveUser('이미지없음', { profileImage: null });

    // when
    const response = await agent.get(URL).query({ find: '이미지없음' });

    // then
    const { data } = response.body as SearchResponseBody;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.result[0]).toStrictEqual({
      id: user.id,
      userName: user.userName,
      profileImage: null,
    });
  });

  it('[200] LIKE 와일드카드(%)가 포함된 검색어는 리터럴로 처리한다.', async () => {
    // given
    const literal = await saveUser('a%b');
    await saveUser('axb'); // 이스케이프 없으면 %가 와일드카드가 되어 함께 매칭됨

    // when
    const response = await agent.get(URL).query({ find: 'a%b' });

    // then
    const { data } = response.body as SearchResponseBody;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.totalCount).toBe(1);
    expect(data.result[0].id).toBe(literal.id);
  });

  it('[200] 검색 결과가 없으면 빈 배열을 반환한다.', async () => {
    // given
    await saveUser('김개발');

    // when
    const response = await agent.get(URL).query({ find: '존재하지않는닉네임' });

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({
      totalCount: 0,
      result: [],
      totalPages: 0,
      limit: 5,
    });
  });

  it('[200] page와 limit으로 페이지네이션한다.', async () => {
    // given - '김0' ~ '김5' 6명, 모두 '김' prefix → 가나다순 정렬.
    const users = await Promise.all(
      Array.from({ length: 6 }).map((_, i) => saveUser(`김${i}`)),
    );

    // when
    const response = await agent
      .get(URL)
      .query({ find: '김', page: 2, limit: 2 });

    // then
    const { data } = response.body as SearchResponseBody;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.totalCount).toBe(6);
    expect(data.totalPages).toBe(3);
    expect(data.limit).toBe(2);
    expect(data.result.map((user) => user.id)).toStrictEqual([
      users[2].id,
      users[3].id,
    ]);
  });

  it('[200] 로그인 사용자의 검색 결과에서 차단한 유저를 제외하고 totalCount에도 반영한다.', async () => {
    // given
    const viewer = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
    const blocked = await saveUser('김차단');
    const visible = await saveUser('김공개');
    await blockRepository.save({
      blocker: { id: viewer.id },
      blocked: { id: blocked.id },
    });
    const accessToken = createAccessToken(viewer);

    // when
    const response = await agent
      .get(URL)
      .query({ find: '김' })
      .set('Authorization', `Bearer ${accessToken}`);

    // then
    const { data } = response.body as SearchResponseBody;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.totalCount).toBe(1);
    expect(data.result.map((user) => user.id)).toStrictEqual([visible.id]);
  });

  it('[200] 비로그인 사용자의 검색 결과에는 차단 필터가 적용되지 않는다.', async () => {
    // given - 다른 유저가 차단했더라도 비로그인 검색에는 영향이 없다
    const otherUser = await userRepository.save(
      UserFixture.createUserFixture(),
    );
    const blocked = await saveUser('김차단');
    await blockRepository.save({
      blocker: { id: otherUser.id },
      blocked: { id: blocked.id },
    });

    // when
    const response = await agent.get(URL).query({ find: '김차단' });

    // then
    const { data } = response.body as SearchResponseBody;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.totalCount).toBe(1);
    expect(data.result[0].id).toBe(blocked.id);
  });

  it('[200] 정지 중인 유저는 검색 결과에서 제외한다.', async () => {
    // given
    const suspended = await saveUser('김정지');
    const visible = await saveUser('김공개');
    await userSuspensionRepository.save({
      user: { id: suspended.id },
      detail: '정지 처리',
      suspendedUntil: null,
    });

    // when
    const response = await agent.get(URL).query({ find: '김' });

    // then
    const { data } = response.body as SearchResponseBody;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.totalCount).toBe(1);
    expect(data.result.map((user) => user.id)).toStrictEqual([visible.id]);
  });

  it('[400] 검색어(find)가 없으면 검증에 실패한다.', async () => {
    // when
    const response = await agent.get(URL).query({});

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(data).toBeUndefined();
  });
});
