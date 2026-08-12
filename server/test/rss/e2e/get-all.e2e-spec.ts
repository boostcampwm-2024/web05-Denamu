import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { RssBlockRepository } from '@block/repository/rssBlock.repository';

import { FeedRepository } from '@feed/repository/feed.repository';

import { SearchRssResponseDto } from '@rss/dto/response/searchRss.dto';
import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { UserRepository } from '@user/repository/user.repository';

import { FeedFixture } from '@test/config/common/fixture/feed.fixture';
import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { createAccessToken, testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/rss';

describe(`GET ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let rssAcceptRepository: RssAcceptRepository;
  let feedRepository: FeedRepository;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    rssAcceptRepository = testApp.get(RssAcceptRepository);
    feedRepository = testApp.get(FeedRepository);
  });

  const createRss = async (
    overwrites: Partial<{ blogPlatform: string }> = {},
  ) =>
    rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(overwrites),
    );

  it('[200] 게시글이 없는 RSS는 등록순(id 내림차순)으로 정렬된다.', async () => {
    // given
    const oldRss = await createRss();
    const newRss = await createRss();

    // when
    const response = await agent.get(URL);

    // then
    expect(response.status).toBe(HttpStatus.OK);
    const { data }: { data: SearchRssResponseDto } = response.body;
    const ids = data.result.map((rss) => rss.id);
    expect(ids.indexOf(newRss.id)).toBeLessThan(ids.indexOf(oldRss.id));
  });

  it('[200] 게시글이 있는 RSS는 등록순과 무관하게 최근 공개 게시글 발행일 순으로 정렬된다.', async () => {
    // given
    const registeredFirst = await createRss();
    await feedRepository.save(
      FeedFixture.createFeedFixture(registeredFirst, {
        isPublic: true,
        createdAt: new Date('2025-01-01'),
      }),
    );
    const registeredSecond = await createRss();
    await feedRepository.save(
      FeedFixture.createFeedFixture(registeredSecond, {
        isPublic: true,
        createdAt: new Date('2025-06-01'),
      }),
    );

    // when
    const response = await agent.get(URL);

    // then
    expect(response.status).toBe(HttpStatus.OK);
    const { data }: { data: SearchRssResponseDto } = response.body;
    const ids = data.result.map((rss) => rss.id);
    expect(ids.indexOf(registeredSecond.id)).toBeLessThan(
      ids.indexOf(registeredFirst.id),
    );
  });

  it('[200] 게시글이 없는 RSS는 게시글이 있는 RSS보다 뒤에 정렬된다.', async () => {
    // given
    const withoutPost = await createRss();
    const withPost = await createRss();
    await feedRepository.save(
      FeedFixture.createFeedFixture(withPost, {
        isPublic: true,
        createdAt: new Date('2020-01-01'),
      }),
    );

    // when
    const response = await agent.get(URL);

    // then
    expect(response.status).toBe(HttpStatus.OK);
    const { data }: { data: SearchRssResponseDto } = response.body;
    const ids = data.result.map((rss) => rss.id);
    expect(ids.indexOf(withPost.id)).toBeLessThan(ids.indexOf(withoutPost.id));
  });

  it('[200] 최근 공개 게시글 발행일을 lastPublishedAt으로 함께 반환한다.', async () => {
    // given
    const rssAccept = await createRss();
    const latest = await feedRepository.save(
      FeedFixture.createFeedFixture(rssAccept, {
        isPublic: true,
        createdAt: new Date('2025-06-01'),
      }),
    );
    await feedRepository.save(
      FeedFixture.createFeedFixture(rssAccept, {
        isPublic: true,
        createdAt: new Date('2025-01-01'),
      }),
    );

    // when
    const response = await agent.get(URL);

    // then
    expect(response.status).toBe(HttpStatus.OK);
    const { data }: { data: SearchRssResponseDto } = response.body;
    const target = data.result.find((rss) => rss.id === rssAccept.id);
    expect(new Date(target.lastPublishedAt).toISOString()).toBe(
      latest.createdAt.toISOString(),
    );
  });

  it('[200] 공개 게시글이 없는 RSS는 lastPublishedAt이 null이다.', async () => {
    // given
    const rssAccept = await createRss();

    // when
    const response = await agent.get(URL);

    // then
    expect(response.status).toBe(HttpStatus.OK);
    const { data }: { data: SearchRssResponseDto } = response.body;
    const target = data.result.find((rss) => rss.id === rssAccept.id);
    expect(target.lastPublishedAt).toBeNull();
  });

  it('[200] page와 limit에 맞춰 페이지네이션된 결과와 totalPages를 반환한다.', async () => {
    // given
    for (let i = 0; i < 5; i++) {
      await createRss();
    }

    // when
    const response = await agent.get(URL).query({ page: 2, limit: 2 });

    // then
    expect(response.status).toBe(HttpStatus.OK);
    const { data }: { data: SearchRssResponseDto } = response.body;
    expect(data.result.length).toBe(2);
    expect(data.totalCount).toBe(5);
    expect(data.totalPages).toBe(3);
    expect(data.limit).toBe(2);
  });

  it('[200] blogPlatform으로 필터링한 RSS만 반환한다.', async () => {
    // given
    const velogRss = await createRss({ blogPlatform: 'velog' });
    await createRss({ blogPlatform: 'tistory' });

    // when
    const response = await agent.get(URL).query({ blogPlatform: 'velog' });

    // then
    expect(response.status).toBe(HttpStatus.OK);
    const { data }: { data: SearchRssResponseDto } = response.body;
    expect(data.result.map((rss) => rss.id)).toEqual([velogRss.id]);
    expect(data.result[0].blogPlatform).toBe('velog');
  });

  it('[200] 공개 게시글 개수를 feedCount로 함께 반환한다.', async () => {
    // given
    const rssAccept = await createRss();
    await feedRepository.save(
      FeedFixture.createFeedFixture(rssAccept, { isPublic: true }),
    );
    await feedRepository.save(
      FeedFixture.createFeedFixture(rssAccept, { isPublic: false }),
    );

    // when
    const response = await agent.get(URL);

    // then
    expect(response.status).toBe(HttpStatus.OK);
    const { data }: { data: SearchRssResponseDto } = response.body;
    const target = data.result.find((rss) => rss.id === rssAccept.id);
    expect(target.feedCount).toBe(1);
  });

  it('[200] 로그인한 사용자가 차단한 RSS는 목록에서 제외된다.', async () => {
    // given
    const userRepository = testApp.get(UserRepository);
    const rssBlockRepository = testApp.get(RssBlockRepository);
    const blockedRss = await createRss();
    const normalRss = await createRss();
    const viewer = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
    await rssBlockRepository.save({
      blocker: { id: viewer.id },
      blockedRss: { id: blockedRss.id },
    });
    const accessToken = createAccessToken(viewer);

    // when
    const response = await agent
      .get(URL)
      .set('Authorization', `Bearer ${accessToken}`);

    // then
    expect(response.status).toBe(HttpStatus.OK);
    const { data }: { data: SearchRssResponseDto } = response.body;
    const ids = data.result.map((rss) => rss.id);
    expect(ids).not.toContain(blockedRss.id);
    expect(ids).toContain(normalRss.id);
  });

  it('[200] 비로그인 사용자에게는 차단 여부와 관계없이 모든 RSS가 제공된다.', async () => {
    // given
    const userRepository = testApp.get(UserRepository);
    const rssBlockRepository = testApp.get(RssBlockRepository);
    const blockedRss = await createRss();
    const viewer = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
    await rssBlockRepository.save({
      blocker: { id: viewer.id },
      blockedRss: { id: blockedRss.id },
    });

    // when
    const response = await agent.get(URL);

    // then
    expect(response.status).toBe(HttpStatus.OK);
    const { data }: { data: SearchRssResponseDto } = response.body;
    expect(data.result.map((rss) => rss.id)).toContain(blockedRss.id);
  });

  it('[400] 허용되지 않은 blogPlatform 값이면 검증에 실패한다.', async () => {
    // when
    const response = await agent.get(URL).query({ blogPlatform: 'blogger' });

    // then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('[400] limit이 100을 초과하면 검증에 실패한다.', async () => {
    // when
    const response = await agent.get(URL).query({ limit: 101 });

    // then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });
});
