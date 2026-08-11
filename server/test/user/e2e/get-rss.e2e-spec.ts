import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { FeedRepository } from '@feed/repository/feed.repository';

import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { GetUserRssResponseDto } from '@user/dto/response/getUserRss.dto';
import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { FeedFixture } from '@test/config/common/fixture/feed.fixture';
import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const makeURL = (id: number | string) => `/api/users/${id}/rss`;

describe(`GET /api/users/:id/rss E2E Test`, () => {
  let agent: TestAgent;
  let rssAcceptRepository: RssAcceptRepository;
  let userRepository: UserRepository;
  let feedRepository: FeedRepository;
  let user: User;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    rssAcceptRepository = testApp.get(RssAcceptRepository);
    userRepository = testApp.get(UserRepository);
    feedRepository = testApp.get(FeedRepository);
  });

  beforeEach(async () => {
    user = await userRepository.save(await UserFixture.createUserCryptFixture());
  });

  it('[200] 소유 RSS가 없으면 빈 배열을 반환한다.', async () => {
    const response = await agent.get(makeURL(user.id));
    expect(response.status).toBe(HttpStatus.OK);
    const { data } = response.body;
    expect(data).toStrictEqual([]);
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
    const { data } = response.body;
    expect(data).toStrictEqual([
      {
        id: rssAccept.id,
        name: rssAccept.name,
        userName: rssAccept.userName,
        rssUrl: rssAccept.rssUrl,
        blogPlatform: rssAccept.blogPlatform,
        feedCount: 0,
        subscriberCount: 0,
        isSubscribed: false,
        blogImage: rssAccept.blogImage ?? null,
        suspensionCount: 0,
      },
    ]);
  });

  it('[200] 각 RSS의 정지 횟수(suspensionCount)를 반환한다.', async () => {
    // given
    const rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture({
        userId: user.id,
        suspensionCount: 2,
      }),
    );

    // when
    const response = await agent.get(makeURL(user.id));

    // then
    expect(response.status).toBe(HttpStatus.OK);
    const { data } = response.body;
    expect(data).toStrictEqual([
      {
        id: rssAccept.id,
        name: rssAccept.name,
        userName: rssAccept.userName,
        rssUrl: rssAccept.rssUrl,
        blogPlatform: rssAccept.blogPlatform,
        feedCount: 0,
        subscriberCount: 0,
        isSubscribed: false,
        blogImage: rssAccept.blogImage ?? null,
        suspensionCount: 2,
      },
    ]);
  });

  it('[200] 각 RSS의 공개 게시글 수(feedCount)를 반환하며 비공개 게시글은 제외한다.', async () => {
    // given (공개 2개 + 비공개 1개)
    const rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture({ userId: user.id }),
    );
    await feedRepository.save(
      FeedFixture.createFeedFixture(rssAccept, { isPublic: true }),
    );
    await feedRepository.save(
      FeedFixture.createFeedFixture(rssAccept, { isPublic: true }),
    );
    await feedRepository.save(
      FeedFixture.createFeedFixture(rssAccept, { isPublic: false }),
    );

    // when
    const response = await agent.get(makeURL(user.id));

    // then
    expect(response.status).toBe(HttpStatus.OK);
    const { data }: { data: GetUserRssResponseDto[] } = response.body;
    const [item] = data;
    expect(item.feedCount).toBe(2);
  });
});
