import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { Feed } from '@feed/entity/feed.entity';
import { FeedRepository } from '@feed/repository/feed.repository';

import { RssAccept } from '@rss/entity/rss.entity';
import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { FeedFixture } from '@test/config/common/fixture/feed.fixture';
import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { createAccessToken, testApp } from '@test/config/e2e/env/jest.setup';

describe(`소유 RSS 게시글 관리 E2E Test`, () => {
  let agent: TestAgent;
  let rssAcceptRepository: RssAcceptRepository;
  let userRepository: UserRepository;
  let feedRepository: FeedRepository;
  let user: User;
  let rssAccept: RssAccept;
  let feeds: Feed[];
  let accessToken: string;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    rssAcceptRepository = testApp.get(RssAcceptRepository);
    userRepository = testApp.get(UserRepository);
    feedRepository = testApp.get(FeedRepository);
  });

  beforeEach(async () => {
    user = await userRepository.save(await UserFixture.createUserCryptFixture());
    rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture({ userId: user.id }),
    );
    accessToken = createAccessToken(user);

    feeds = [];
    for (let i = 0; i < 3; i++) {
      feeds.push(
        await feedRepository.save(
          FeedFixture.createFeedFixture(rssAccept, {
            title: `feed ${i + 1}`,
            commentCount: i,
            isPublic: i !== 1, // 두 번째 글은 비공개
          }),
        ),
      );
    }
  });

  describe(`GET /api/rss/certifications/:id/feeds`, () => {
    const makeURL = (id: number | string) =>
      `/api/rss/certifications/${id}/feeds`;

    it('[401] 로그인하지 않으면 조회할 수 없다.', async () => {
      const response = await agent.get(makeURL(rssAccept.id));
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('[403] 본인이 인증한 RSS가 아니면 조회할 수 없다.', async () => {
      const other = await userRepository.save(
        await UserFixture.createUserCryptFixture(),
      );
      const othersRss = await rssAcceptRepository.save(
        RssAcceptFixture.createRssAcceptFixture({ userId: other.id }),
      );

      const response = await agent
        .get(makeURL(othersRss.id))
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(HttpStatus.FORBIDDEN);
    });

    it('[200] 비공개 게시글을 포함해 isPublic 상태와 함께 최신순으로 조회한다.', async () => {
      const response = await agent
        .get(makeURL(rssAccept.id))
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(HttpStatus.OK);
      const { data } = response.body;
      expect(data.result).toHaveLength(3);
      // id DESC → feeds[2], feeds[1](비공개), feeds[0]
      expect(data.result.map((f: { id: number }) => f.id)).toStrictEqual([
        feeds[2].id,
        feeds[1].id,
        feeds[0].id,
      ]);
      expect(data.result[1].isPublic).toBe(false);
      expect(data.result[0].isPublic).toBe(true);
    });
  });

  describe(`PATCH /api/rss/certifications/:id/feeds/:feedId/visibility`, () => {
    const makeURL = (id: number | string, feedId: number | string) =>
      `/api/rss/certifications/${id}/feeds/${feedId}/visibility`;

    it('[401] 로그인하지 않으면 변경할 수 없다.', async () => {
      const response = await agent
        .patch(makeURL(rssAccept.id, feeds[0].id))
        .send({ isPublic: false });
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('[404] 다른 RSS에 속한 게시글은 변경할 수 없다.', async () => {
      const otherRss = await rssAcceptRepository.save(
        RssAcceptFixture.createRssAcceptFixture({ userId: user.id }),
      );

      const response = await agent
        .patch(makeURL(otherRss.id, feeds[0].id))
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ isPublic: false });

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('[200] 본인 RSS 게시글을 비공개로 전환한다.', async () => {
      const response = await agent
        .patch(makeURL(rssAccept.id, feeds[0].id))
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ isPublic: false });

      expect(response.status).toBe(HttpStatus.OK);
      const saved = await feedRepository.findOneBy({ id: feeds[0].id });
      expect(saved.isPublic).toBe(false);
    });
  });
});
