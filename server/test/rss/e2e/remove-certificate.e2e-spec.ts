import { UserFixture } from '../../config/common/fixture/user.fixture';
import { CommentFixture } from '../../config/common/fixture/comment.fixture';
import { FeedFixture } from '../../config/common/fixture/feed.fixture';
import { REDIS_KEYS } from './../../../src/common/redis/redis.constant';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { HttpStatus, INestApplication } from '@nestjs/common';
import {
  RssAcceptRepository,
  RssRepository,
} from '../../../src/rss/repository/rss.repository';
import { RedisService } from '../../../src/common/redis/redis.service';
import { CommentRepository } from '../../../src/comment/repository/comment.repository';
import { UserRepository } from '../../../src/user/repository/user.repository';
import * as supertest from 'supertest';
import { RssFixture } from '../../config/common/fixture/rss.fixture';
import TestAgent from 'supertest/lib/agent';
import { LikeRepository } from '../../../src/like/repository/like.repository';
import { Rss, RssAccept } from '../../../src/rss/entity/rss.entity';
import { Feed } from '../../../src/feed/entity/feed.entity';
import { User } from '../../../src/user/entity/user.entity';
import { Comment } from '../../../src/comment/entity/comment.entity';
import { RssAcceptFixture } from '../../config/common/fixture/rss-accept.fixture';

const URL = '/api/rss/remove';

describe(`DELETE ${URL}/{code} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let feedRepository: FeedRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let redisService: RedisService;
  let commentRepository: CommentRepository;
  let userRepository: UserRepository;
  let likeRepository: LikeRepository;
  let rssRepository: RssRepository;
  let rssAccept: RssAccept;
  let feed: Feed;
  let user: User;
  let comment: Comment;
  let rss: Rss;
  const redisKeyMake = (data: string) => `${REDIS_KEYS.RSS_REMOVE_KEY}:${data}`;
  const rssDeleteCode = 'rss-remove-certificate';

  beforeAll(() => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    rssAcceptRepository = app.get(RssAcceptRepository);
    rssRepository = app.get(RssRepository);
    redisService = app.get(RedisService);
    feedRepository = app.get(FeedRepository);
    commentRepository = app.get(CommentRepository);
    userRepository = app.get(UserRepository);
    likeRepository = app.get(LikeRepository);
  });

  beforeEach(async () => {
    [rss, rssAccept] = await Promise.all([
      rssRepository.save(RssFixture.createRssFixture()),
      rssAcceptRepository.save(RssAcceptFixture.createRssAcceptFixture()),
    ]);
    [user, feed] = await Promise.all([
      userRepository.save(await UserFixture.createUserCryptFixture()),
      feedRepository.save(FeedFixture.createFeedFixture(rssAccept)),
    ]);
    comment = await commentRepository.save(
      CommentFixture.createCommentFixture(feed, user),
    );
  });

  afterEach(async () => {
    await commentRepository.delete(comment.id);
    await Promise.all([
      feedRepository.delete(feed.id),
      userRepository.delete(user.id),
    ]);
    await Promise.all([
      rssAcceptRepository.delete(rssAccept.id),
      rssRepository.delete(rss.id),
      redisService.del(redisKeyMake(rssDeleteCode)),
    ]);
  });

  it('[404] RSS 삭제 요청이 만료되었거나 없을 경우 RSS 삭제 인증을 실패한다.', async () => {
    // Http when
    const response = await agent.delete(`${URL}/Wrong${rssDeleteCode}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedRssRemoveURL = await redisService.get(
      redisKeyMake(rssDeleteCode),
    );

    // DB, Redis then
    expect(savedRssRemoveURL).toBeNull();
  });

  it('[200] 삭제 신청된 RSS가 승인된 RSS에 있을 경우 승인된 RSS와 관련된 모든 데이터들의 삭제를 성공한다.', async () => {
    // given
    await redisService.set(redisKeyMake(rssDeleteCode), rssAccept.rssUrl);

    // Http when
    const response = await agent.delete(`${URL}/${rssDeleteCode}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();

    // DB, Redis when
    const [
      savedRssAccept,
      savedFeed,
      savedComment,
      savedLike,
      savedRssRemoveURL,
    ] = await Promise.all([
      rssAcceptRepository.findOneBy({
        rssUrl: rssAccept.rssUrl,
      }),
      feedRepository.findBy({ blog: rssAccept }),
      commentRepository.findBy({
        feed: { id: feed.id },
      }),
      likeRepository.findBy({ feed: { id: feed.id } }),
      redisService.get(redisKeyMake(rssDeleteCode)),
    ]);

    // DB, Redis then
    expect(savedRssAccept).toBeNull();
    expect(savedFeed.length).toBe(0);
    expect(savedComment.length).toBe(0);
    expect(savedLike.length).toBe(0);
    expect(savedRssRemoveURL).toBeNull();
  });

  it('[200] 삭제 신청된 RSS가 대기중인 RSS에 있을 경우 대기중인 RSS 데이터 삭제를 성공한다.', async () => {
    // given
    await redisService.set(redisKeyMake(rssDeleteCode), rss.rssUrl);

    // Http when
    const response = await agent.delete(`${URL}/${rssDeleteCode}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();

    // DB, Redis when
    const [savedRss, savedRssRemoveURL] = await Promise.all([
      rssRepository.findOneBy({
        rssUrl: rss.rssUrl,
      }),
      redisService.get(redisKeyMake(rssDeleteCode)),
    ]);

    // DB, Redis then
    expect(savedRss).toBeNull();
    expect(savedRssRemoveURL).toBeNull();
  });
});
