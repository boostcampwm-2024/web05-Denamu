import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { Feed } from '../../../src/feed/entity/feed.entity';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { RssAcceptFixture } from '../../config/common/fixture/rss-accept.fixture';
import { FeedFixture } from '../../config/common/fixture/feed.fixture';
import { GetCommentRequestDto } from '../../../src/comment/dto/request/getComment.dto';
import TestAgent from 'supertest/lib/agent';
import { CommentRepository } from '../../../src/comment/repository/comment.repository';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { UserFixture } from '../../config/common/fixture/user.fixture';
import { CommentFixture } from '../../config/common/fixture/comment.fixture';
import { RssAccept } from '../../../src/rss/entity/rss.entity';
import { User } from '../../../src/user/entity/user.entity';
import { Comment } from '../../../src/comment/entity/comment.entity';

const URL = '/api/comment';

describe(`GET ${URL}/{feedId} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let feed: Feed;
  let commentRepository: CommentRepository;
  let userRepository: UserRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let feedRepository: FeedRepository;
  let rssAccept: RssAccept;
  let user: User;
  let comment: Comment;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    commentRepository = app.get(CommentRepository);
    userRepository = app.get(UserRepository);
    rssAcceptRepository = app.get(RssAcceptRepository);
    feedRepository = app.get(FeedRepository);
  });

  beforeEach(async () => {
    rssAccept = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
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
      userRepository.delete(user.id),
      feedRepository.delete(feed.id),
    ]);
    await rssAcceptRepository.delete(rssAccept.id);
  });

  it('[404] 게시글이 존재하지 않을 경우 댓글 조회를 실패한다.', async () => {
    // Http when
    const response = await agent.get(`${URL}/${Number.MAX_SAFE_INTEGER}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();
  });

  it('[200] 게시글이 존재할 경우 댓글 조회를 성공한다.', async () => {
    // given
    const requestDto = new GetCommentRequestDto({
      feedId: feed.id,
    });

    // Http when
    const response = await agent.get(`${URL}/${requestDto.feedId}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual([
      {
        id: comment.id,
        comment: comment.comment,
        date: comment.date.toISOString(),
        user: {
          id: user.id,
          userName: user.userName,
          profileImage: user.profileImage,
        },
      },
    ]);
  });
});
