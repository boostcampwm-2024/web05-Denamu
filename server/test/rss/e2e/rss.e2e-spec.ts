import { INestApplication } from '@nestjs/common';
import { RssRegisterRequestDto } from '../../../src/rss/dto/request/rss-register.dto';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { Rss, RssAccept } from '../../../src/rss/entity/rss.entity';
import { RssFixture } from '../../fixture/rss.fixture';
import { RssAcceptFixture } from '../../fixture/rssAccept.fixture';
import {
  RssAcceptRepository,
  RssRepository,
} from '../../../src/rss/repository/rss.repository';

describe('/api/rss E2E Test', () => {
  let app: INestApplication;
  let rssRepository: Repository<Rss>;
  let rssAcceptRepository: Repository<RssAccept>;

  beforeAll(() => {
    app = global.testApp;
    rssRepository = app.get(RssRepository);
    rssAcceptRepository = app.get(RssAcceptRepository);
  });

  beforeEach(async () => {
    await rssRepository.delete({});
  });

  describe('POST /api/rss E2E Test', () => {
    it('정상적인 요청이 들어왔다면 올바른 응답을 한다.', async () => {
      // given
      const requestDto = new RssRegisterRequestDto({
        blog: 'blog1',
        name: 'name1',
        email: 'test1@test.com',
        rssUrl: 'https://example1.com/rss',
      });

      // when
      const response = await request(app.getHttpServer())
        .post('/api/rss')
        .send(requestDto);

      // then
      expect(response.status).toBe(201);
    });

    it('이미 신청한 RSS를 또 신청한다면 거부를 한다.', async () => {
      // given
      const requestDto = new RssRegisterRequestDto({
        blog: 'blog1',
        name: 'name1',
        email: 'test1@test.com',
        rssUrl: 'https://example1.com/rss',
      });
      await request(app.getHttpServer()).post('/api/rss').send(requestDto);

      // when
      const response = await request(app.getHttpServer())
        .post('/api/rss')
        .send(requestDto);

      // then
      expect(response.status).toBe(409);
    });

    it('이미 등록된 RSS를 또 신청한다면 거부를 한다.', async () => {
      // given
      const acceptedRss = await rssAcceptRepository.save(
        RssAcceptFixture.createRssAcceptFixture(),
      );
      const rssRegisterDto = new RssRegisterRequestDto({
        blog: acceptedRss.name,
        name: acceptedRss.userName,
        email: acceptedRss.email,
        rssUrl: acceptedRss.rssUrl,
      });

      // when
      const response = await request(app.getHttpServer())
        .post('/api/rss')
        .send(rssRegisterDto);

      // then
      expect(response.status).toBe(409);
    });
  });

  describe('GET /api/rss', () => {
    describe('정상적인 요청을 한다.', () => {
      it('RSS가 등록되지 않은 경우 빈 리스트를 반환한다.', async () => {
        // when - then
        const response = await request(app.getHttpServer()).get('/api/rss');
        expect(response.status).toBe(200);
        expect(response.body.data).toEqual([]);
      });

      it('등록된 RSS가 존재할 경우 해당 데이터를 반환한다.', async () => {
        // given
        const expectedResult = await rssRepository.save(
          RssFixture.createRssFixture(),
        );

        // when
        const response = await request(app.getHttpServer()).get('/api/rss');

        //then
        expect(response.status).toBe(200);
        expect(response.body.data).toEqual([expectedResult]);
      });
    });
  });
});
