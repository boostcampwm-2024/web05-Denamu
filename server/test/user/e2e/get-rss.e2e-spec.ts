import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { GetUserRssResponseDto } from '@user/dto/response/getUserRss.dto';
import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const makeURL = (id: number | string) => `/api/users/${id}/rss`;

describe(`GET /api/users/:id/rss E2E Test`, () => {
  let agent: TestAgent;
  let rssAcceptRepository: RssAcceptRepository;
  let userRepository: UserRepository;
  let user: User;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    rssAcceptRepository = testApp.get(RssAcceptRepository);
    userRepository = testApp.get(UserRepository);
  });

  beforeEach(async () => {
    user = await userRepository.save(await UserFixture.createUserCryptFixture());
  });

  it('[200] 소유 RSS가 없으면 빈 배열을 반환한다.', async () => {
    const response = await agent.get(makeURL(user.id));
    expect(response.status).toBe(HttpStatus.OK);
    const { data } = response.body;
    expect(data).toEqual([]);
  });

  it('[200] 소유한 RSS 목록을 반환하며 email 등 민감 정보는 제외한다.', async () => {
    // given
    const rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture({ userId: user.id }),
    );
    // 다른 유저 소유 RSS는 포함되면 안 된다.
    const other = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
    await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture({ userId: other.id }),
    );

    // Http when
    const response = await agent.get(makeURL(user.id));

    // Http then
    expect(response.status).toBe(HttpStatus.OK);
    const { data }: { data: GetUserRssResponseDto[] } = response.body;
    expect(data).toHaveLength(1);
    const [item] = data;
    expect(item.id).toBe(rssAccept.id);
    expect(item.name).toBe(rssAccept.name);
    expect(item.blogPlatform).toBe(rssAccept.blogPlatform);
    expect(item).not.toHaveProperty('email');
  });
});
