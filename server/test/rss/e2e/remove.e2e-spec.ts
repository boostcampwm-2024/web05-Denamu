import { REDIS_KEYS } from './../../../src/common/redis/redis.constant';
import { HttpStatus, INestApplication } from '@nestjs/common';
import {
  RssAcceptRepository,
  RssRepository,
} from '../../../src/rss/repository/rss.repository';
import { RssFixture } from '../../fixture/rss.fixture';
import * as request from 'supertest';
import { RedisService } from '../../../src/common/redis/redis.service';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { FeedFixture } from '../../fixture/feed.fixture';
import { CommentRepository } from '../../../src/comment/repository/comment.repository';
import { CommentFixture } from '../../fixture/comment.fixture';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { UserFixture } from '../../fixture/user.fixture';

describe('/api/rss/remove E2E Test', () => {
  let app: INestApplication;
  let rssRepository: RssRepository;
  let feedRepository: FeedRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let redisService: RedisService;
  let commentRepository: CommentRepository;
  let userRepository: UserRepository;

  beforeAll(() => {
    app = global.testApp;
    rssRepository = app.get(RssRepository);
    rssAcceptRepository = app.get(RssAcceptRepository);
    redisService = app.get(RedisService);
    feedRepository = app.get(FeedRepository);
    commentRepository = app.get(CommentRepository);
    userRepository = app.get(UserRepository);
  });

  describe('POST /api/rss/remove E2E Test', () => {
    it('[404] RSS가 없을 경우 신청할 수 없다.', async () => {
      // given
      // when
      const response = await request(app.getHttpServer())
        .post('/api/rss/remove')
        .send({
          blogUrl: 'https://test.com',
          userName: 'test',
          email: 'test@test.com',
        });
      // then
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('[200] 대기 RSS가 있을 경우 신청할 수 있다.', async () => {
      // given
      const rss = await rssRepository.save(RssFixture.createRssFixture());

      // when
      const response = await request(app.getHttpServer())
        .post('/api/rss/remove')
        .send({
          blogUrl: rss.rssUrl,
          userName: rss.userName,
          email: rss.email,
        });

      // then
      expect(response.status).toBe(HttpStatus.OK);
    });

    it('[200] 승인된 RSS가 있을 경우 신청할 수 있다.', async () => {
      // given
      const rss = await rssAcceptRepository.save(RssFixture.createRssFixture());

      // when
      const response = await request(app.getHttpServer())
        .post('/api/rss/remove')
        .send({
          blogUrl: rss.rssUrl,
          userName: rss.userName,
          email: rss.email,
        });

      // then
      expect(response.status).toBe(HttpStatus.OK);
    });
  });

  describe('DELETE /api/rss/remove/{code}', () => {
    it('[404] 삭제 신청된 RSS가 없으면 인증할 수 없다.', async () => {
      // when
      const response = await request(app.getHttpServer())
        .delete(`/api/rss/remove/testfail`)
        .send();

      // then
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('[404] 이미 지워진 RSS라면 지울 수 없다.', async () => {
      // given
      await redisService.set(
        `${REDIS_KEYS.RSS_REMOVE_KEY}:rssNotFound`,
        'test',
      );

      // when
      const response = await request(app.getHttpServer())
        .delete(`/api/rss/remove/rssNotFound`)
        .send();

      // then
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('[200] 삭제 신청된 RSS가 있을 경우 좋아요, 댓글, 게시글, RSS가 한 번에 삭제된다.', async () => {
      // given
      const certificateCode = 'test';
      const rss = await rssAcceptRepository.save(RssFixture.createRssFixture());
      const feed = await feedRepository.save(
        FeedFixture.createFeedFixture(rss),
      );
      const user = await userRepository.save(
        await UserFixture.createUserCryptFixture(),
      );
      await commentRepository.save(
        CommentFixture.createCommentFixture(feed, user),
      );
      await redisService.set(
        `${REDIS_KEYS.RSS_REMOVE_KEY}:${certificateCode}`,
        rss.rssUrl,
      );

      // when
      const response = await request(app.getHttpServer())
        .delete(`/api/rss/remove/${certificateCode}`)
        .send();

      // then
      expect(response.status).toBe(HttpStatus.OK);
    });
  });
});
