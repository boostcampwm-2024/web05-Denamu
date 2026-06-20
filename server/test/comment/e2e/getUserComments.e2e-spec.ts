import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { Comment } from '@comment/entity/comment.entity';
import { CommentRepository } from '@comment/repository/comment.repository';
import { GetUserCommentsResponseDto } from '@comment/dto/response/getUserComments.dto';

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
import { testApp } from '@test/config/e2e/env/jest.setup';

const BASE_URL = '/api/users';

describe(`GET ${BASE_URL}/:userId/comments E2E Test`, () => {
  let agent: TestAgent;
  let commentRepository: CommentRepository;
  let userRepository: UserRepository;
  let rssAcceptRepository: RssAcceptRepository;
  let feedRepository: FeedRepository;
  let rssAccept: RssAccept;
  let feed: Feed;
  let user: User;
  let comments: Comment[];

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    commentRepository = testApp.get(CommentRepository);
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

    // 동일 유저가 작성한 댓글 3개를 id 오름차순으로 저장
    comments = [];
    for (let i = 0; i < 3; i++) {
      comments.push(
        await commentRepository.save(
          CommentFixture.createCommentFixture(feed, user, {
            comment: `comment ${i + 1}`,
          }),
        ),
      );
    }
  });

  it('[404] 존재하지 않는 유저일 경우 댓글 조회를 실패한다.', async () => {
    // Http when
    const response = await agent.get(
      `${BASE_URL}/${Number.MAX_SAFE_INTEGER}/comments`,
    );

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();
  });

  it('[200] 유저가 작성한 댓글을 게시글 정보(path 포함)와 함께 최신순으로 조회한다.', async () => {
    // Http when
    const response = await agent.get(`${BASE_URL}/${user.id}/comments`);

    // Http then
    const { data }: { data: GetUserCommentsResponseDto } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.hasMore).toBe(false);
    expect(data.lastId).toBe(comments[0].id);
    expect(data.result).toStrictEqual(
      [...comments].reverse().map((comment) => ({
        id: comment.id,
        comment: comment.comment,
        date: comment.date.toISOString(),
        feed: {
          id: feed.id,
          title: feed.title,
          path: feed.path,
        },
      })),
    );
  });

  it('[200] limit으로 페이지 크기를 제한하고 hasMore와 커서(lastId)를 반환한다.', async () => {
    // Http when
    const response = await agent.get(
      `${BASE_URL}/${user.id}/comments?limit=2`,
    );

    // Http then
    const { data }: { data: GetUserCommentsResponseDto } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.result).toHaveLength(2);
    expect(data.hasMore).toBe(true);
    // 최신순 → comments[2], comments[1]
    expect(data.result[0].id).toBe(comments[2].id);
    expect(data.lastId).toBe(comments[1].id);
  });

  it('[200] lastId 커서 이후의 댓글만 조회한다.', async () => {
    // Http when
    const response = await agent.get(
      `${BASE_URL}/${user.id}/comments?lastId=${comments[1].id}`,
    );

    // Http then
    const { data }: { data: GetUserCommentsResponseDto } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.result).toHaveLength(1);
    expect(data.result[0].id).toBe(comments[0].id);
    expect(data.hasMore).toBe(false);
  });

  it('[200] 비공개 게시글에 작성한 댓글은 목록에서 제외된다.', async () => {
    // given - 비공개 게시글에 댓글 작성
    const privateFeed = await feedRepository.save(
      FeedFixture.createFeedFixture(rssAccept, { isPublic: false }),
    );
    const privateComment = await commentRepository.save(
      CommentFixture.createCommentFixture(privateFeed, user, { comment: 'private' }),
    );

    // Http when
    const response = await agent.get(`${BASE_URL}/${user.id}/comments`);

    // Http then
    const { data }: { data: GetUserCommentsResponseDto } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    const ids = data.result.map((item) => item.id);
    expect(ids).not.toContain(privateComment.id);
    expect(data.result).toHaveLength(3);
  });

  it('[200] 댓글이 없는 유저는 빈 목록과 lastId=0을 반환한다.', async () => {
    // Http given
    const otherUser = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );

    // Http when
    const response = await agent.get(`${BASE_URL}/${otherUser.id}/comments`);

    // Http then
    const { data }: { data: GetUserCommentsResponseDto } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.result).toStrictEqual([]);
    expect(data.lastId).toBe(0);
    expect(data.hasMore).toBe(false);
  });
});
