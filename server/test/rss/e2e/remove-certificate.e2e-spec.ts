import { UserFixture } from '../../fixture/user.fixture';
import { CommentFixture } from '../../fixture/comment.fixture';
import { FeedFixture } from '../../fixture/feed.fixture';
import { REDIS_KEYS } from './../../../src/common/redis/redis.constant';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import { RedisService } from '../../../src/common/redis/redis.service';
import { CommentRepository } from '../../../src/comment/repository/comment.repository';
import { UserRepository } from '../../../src/user/repository/user.repository';
import * as supertest from 'supertest';
import { RssFixture } from '../../fixture/rss.fixture';
import TestAgent from 'supertest/lib/agent';

const URL = '/api/rss/remove';

describe(`DELETE ${URL}/{code} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let feedRepository: FeedRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let redisService: RedisService;
  let commentRepository: CommentRepository;
  let userRepository: UserRepository;

  beforeAll(() => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    rssAcceptRepository = app.get(RssAcceptRepository);
    redisService = app.get(RedisService);
    feedRepository = app.get(FeedRepository);
    commentRepository = app.get(CommentRepository);
    userRepository = app.get(UserRepository);
  });

  it('[404] RSS 삭제 요청이 만료되었거나 없을 경우 RSS 삭제 인증을 실패한다.', async () => {
    // when
    const response = await agent.delete(`${URL}/${Number.MAX_SAFE_INTEGER}`);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();
  });

  it('[200] 삭제 신청된 RSS가 있을 경우 RSS와 관련된 모든 데이터들의 삭제 인증을 성공한다.', async () => {
    // given
    const certificateCode = 'test';
    const rss = await rssAcceptRepository.save(RssFixture.createRssFixture());
    const feed = await feedRepository.save(FeedFixture.createFeedFixture(rss));
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
    const response = await agent.delete(`${URL}/${certificateCode}`);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();
  });
});
