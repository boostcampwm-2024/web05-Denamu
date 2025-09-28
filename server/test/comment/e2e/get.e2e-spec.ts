import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Feed } from '../../../src/feed/entity/feed.entity';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { RssAcceptFixture } from '../../fixture/rssAccept.fixture';
import { FeedFixture } from '../../fixture/feed.fixture';
import { GetCommentRequestDto } from '../../../src/comment/dto/request/getComment.dto';

describe('GET /api/comment/:feedId E2E Test', () => {
  let app: INestApplication;
  let feed: Feed;

  beforeAll(async () => {
    app = global.testApp;
    const rssAcceptRepository = app.get(RssAcceptRepository);
    const feedRepository = app.get(FeedRepository);
    const rssAcceptInformation = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    feed = await feedRepository.save(
      FeedFixture.createFeedFixture(rssAcceptInformation),
    );
  });

  it('[404] 게시글이 존재하지 않을 경우 조회 오류가 발생한다.', async () => {
    // given
    const comment = new GetCommentRequestDto({
      feedId: 100,
    });
    const agent = request.agent(app.getHttpServer());

    // when
    const response = await agent
      .get(`/api/comment/${comment.feedId}`)
      .send(comment);

    // then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[200] 게시글이 존재할 경우 올바르게 댓글을 제공한다.', async () => {
    // given
    const comment = new GetCommentRequestDto({
      feedId: feed.id,
    });
    const agent = request.agent(app.getHttpServer());

    // when
    const response = await agent
      .get(`/api/comment/${comment.feedId}`)
      .send(comment);

    // then
    expect(response.status).toBe(HttpStatus.OK);
  });
});
