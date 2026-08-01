import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { UserBlockRepository } from '@block/repository/userBlock.repository';

import { Comment } from '@comment/entity/comment.entity';
import { CommentRepository } from '@comment/repository/comment.repository';

import { Feed } from '@feed/entity/feed.entity';
import { FeedRepository } from '@feed/repository/feed.repository';

import { RssAccept } from '@rss/entity/rss.entity';
import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { CommentFixture } from '@test/config/common/fixture/comment.fixture';
import { FeedFixture } from '@test/config/common/fixture/feed.fixture';
import { RssAcceptFixture } from '@test/config/common/fixture/rss-accept.fixture';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { createAccessToken, testApp } from '@test/config/e2e/env/jest.setup';

const BASE_URL = '/api/feeds';

describe(`GET ${BASE_URL}/:feedId/comments E2E Test`, () => {
  let agent: TestAgent;
  let feed: Feed;
  let commentRepository: CommentRepository;
  let blockRepository: UserBlockRepository;
  let userRepository: UserRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let feedRepository: FeedRepository;
  let rssAccept: RssAccept;
  let user: User;
  let comment: Comment;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    commentRepository = testApp.get(CommentRepository);
    blockRepository = testApp.get(UserBlockRepository);
    userRepository = testApp.get(UserRepository);
    rssAcceptRepository = testApp.get(RssAcceptRepository);
    feedRepository = testApp.get(FeedRepository);
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

  it('[404] 게시글이 존재하지 않을 경우 댓글 조회를 실패한다.', async () => {
    // Http when
    const response = await agent.get(
      `${BASE_URL}/${Number.MAX_SAFE_INTEGER}/comments`,
    );

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();
  });

  it('[404] 비공개 게시글의 댓글은 조회할 수 없다.', async () => {
    // given - 비공개 게시글 + 댓글
    const privateFeed = await feedRepository.save(
      FeedFixture.createFeedFixture(rssAccept, { isPublic: false }),
    );
    await commentRepository.save(
      CommentFixture.createCommentFixture(privateFeed, user),
    );

    // Http when
    const response = await agent.get(`${BASE_URL}/${privateFeed.id}/comments`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();
  });

  it('[200] 게시글이 존재할 경우 댓글 조회를 성공한다.', async () => {
    // Http when
    const response = await agent.get(`${BASE_URL}/${feed.id}/comments`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual([
      {
        id: comment.id,
        parentId: null,
        isDeleted: false,
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

  it('[200] 차단한 사용자의 댓글은 조회 결과에서 제외된다.', async () => {
    // given - viewer가 기존 댓글 작성자(user)를 차단한 상태
    const viewer = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
    await blockRepository.save({
      blocker: { id: viewer.id },
      blocked: { id: user.id },
    });
    const accessToken = createAccessToken(viewer);

    // Http when
    const response = await agent
      .get(`${BASE_URL}/${feed.id}/comments`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual([]);
  });

  it('[200] 차단한 사용자가 작성한 부모 댓글은 대댓글까지 스레드 통째로 제외된다.', async () => {
    // given - 차단된 user의 부모 댓글(comment)에 viewer가 아닌 유저의 대댓글 존재
    const [viewer, replier] = await Promise.all([
      userRepository.save(await UserFixture.createUserCryptFixture()),
      userRepository.save(UserFixture.createUserFixture()),
    ]);
    await commentRepository.save(
      CommentFixture.createCommentFixture(feed, replier, {
        parentId: comment.id,
      }),
    );
    const normalComment = await commentRepository.save(
      CommentFixture.createCommentFixture(feed, replier),
    );
    await blockRepository.save({
      blocker: { id: viewer.id },
      blocked: { id: user.id },
    });
    const accessToken = createAccessToken(viewer);

    // Http when
    const response = await agent
      .get(`${BASE_URL}/${feed.id}/comments`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then - 차단 스레드는 사라지고 차단되지 않은 최상위 댓글만 남는다
    const { data } = response.body as { data: { id: number }[] };
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.map((item) => item.id)).toStrictEqual([normalComment.id]);
  });

  it('[200] 차단하지 않은 부모 댓글의 대댓글 중 차단한 사용자의 대댓글만 제외된다.', async () => {
    // given - replier의 부모 댓글에 user(차단 대상)와 replier의 대댓글이 달린 상태
    const [viewer, replier] = await Promise.all([
      userRepository.save(await UserFixture.createUserCryptFixture()),
      userRepository.save(UserFixture.createUserFixture()),
    ]);
    const parent = await commentRepository.save(
      CommentFixture.createCommentFixture(feed, replier),
    );
    await commentRepository.save(
      CommentFixture.createCommentFixture(feed, user, {
        parentId: parent.id,
      }),
    );
    const normalReply = await commentRepository.save(
      CommentFixture.createCommentFixture(feed, replier, {
        parentId: parent.id,
      }),
    );
    await blockRepository.save({
      blocker: { id: viewer.id },
      blocked: { id: user.id },
    });
    const accessToken = createAccessToken(viewer);

    // Http when
    const response = await agent
      .get(`${BASE_URL}/${feed.id}/comments`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then - user의 최상위 댓글(comment)과 user의 대댓글만 제외된다
    const { data } = response.body as { data: { id: number }[] };
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.map((item) => item.id).sort((a, b) => a - b)).toStrictEqual(
      [parent.id, normalReply.id].sort((a, b) => a - b),
    );
  });

  it('[200] 비로그인 사용자는 차단 필터 없이 모든 댓글을 조회한다.', async () => {
    // given - 다른 유저가 user를 차단한 상태여도 비로그인 조회에는 영향이 없다
    const otherUser = await userRepository.save(
      UserFixture.createUserFixture(),
    );
    await blockRepository.save({
      blocker: { id: otherUser.id },
      blocked: { id: user.id },
    });

    // Http when
    const response = await agent.get(`${BASE_URL}/${feed.id}/comments`);

    // Http then
    const { data } = response.body as { data: { id: number }[] };
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toHaveLength(1);
    expect(data[0].id).toBe(comment.id);
  });
});
