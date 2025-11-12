import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Feed } from '../../../src/feed/entity/feed.entity';
import { RssAcceptRepository } from '../../../src/rss/repository/rss.repository';
import { FeedRepository } from '../../../src/feed/repository/feed.repository';
import { RssAcceptFixture } from '../../fixture/rss-accept.fixture';
import { FeedFixture } from '../../fixture/feed.fixture';
import { GetCommentRequestDto } from '../../../src/comment/dto/request/getComment.dto';
import TestAgent from 'supertest/lib/agent';

describe('GET /api/comment/{feedId} E2E Test', () => {
  let app: INestApplication;
  let agent: TestAgent;
  let feed: Feed;

  beforeAll(async () => {
    app = global.testApp;
    agent = request.agent(app.getHttpServer());
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
    const requestDto = new GetCommentRequestDto({
      feedId: 100,
    });

    // when
    const response = await agent
      .get(`/api/comment/${requestDto.feedId}`)
      .send(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[200] 게시글이 존재할 경우 올바르게 댓글을 제공한다.', async () => {
    // given
    const requestDto = new GetCommentRequestDto({
      feedId: feed.id,
    });

    // when
    const response = await agent
      .get(`/api/comment/${requestDto.feedId}`)
      .send(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.OK);
  });
});
