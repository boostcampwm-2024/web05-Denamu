import { HttpStatus } from '@nestjs/common';
import { RegisterRssRequestDto } from '../../../src/rss/dto/request/registerRss.dto';
import { RssAcceptFixture } from '../../config/common/fixture/rss-accept.fixture';
import { RssFixture } from '../../config/common/fixture/rss.fixture';
import { RssE2EHelper } from '../../config/common/helper/rss/rss-helper';

const URL = '/api/rss';

describe(`POST ${URL} E2E Test`, () => {
  const { agent, rssRepository, rssAcceptRepository } = new RssE2EHelper();

  it('[409] 이미 신청한 RSS를 다시 신청할 경우 RSS 등록 요청을 실패한다.', async () => {
    // given
    const rss = await rssRepository.save(RssFixture.createRssFixture());
    const requestDto = new RegisterRssRequestDto({
      blog: 'blog1',
      name: 'name1',
      email: 'test1@test.com',
      rssUrl: rss.rssUrl,
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.CONFLICT);
    expect(data).toBeUndefined();

    // DB, Redis when
    const [savedRss, savedRssAccept] = await Promise.all([
      rssRepository.findBy({
        rssUrl: rss.rssUrl,
      }),
      rssAcceptRepository.findBy({
        rssUrl: rss.rssUrl,
      }),
    ]);

    // DB, Redis then
    expect(savedRss.length).toBe(1);
    expect(savedRssAccept.length).toBe(0);

    // cleanup
    await rssRepository.delete(rss.id);
  });

  it('[409] 이미 등록 완료된 RSS를 다시 신청할 경우 RSS 등록 요청을 실패한다.', async () => {
    // given
    const acceptedRss = await rssAcceptRepository.save(
      RssAcceptFixture.createRssAcceptFixture(),
    );
    const requestDto = new RegisterRssRequestDto({
      blog: acceptedRss.name,
      name: acceptedRss.userName,
      email: acceptedRss.email,
      rssUrl: acceptedRss.rssUrl,
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.CONFLICT);
    expect(data).toBeUndefined();

    // DB, Redis when
    const [savedRss, savedRssAccept] = await Promise.all([
      rssRepository.findBy({
        rssUrl: acceptedRss.rssUrl,
      }),
      rssAcceptRepository.findBy({
        rssUrl: acceptedRss.rssUrl,
      }),
    ]);

    // DB, Redis then
    expect(savedRss.length).toBe(0);
    expect(savedRssAccept.length).toBe(1);

    // cleanup
    await rssAcceptRepository.delete(acceptedRss.id);
  });

  it('[201] 등록되지 않은 RSS 등록 요청을 받았을 경우 RSS 등록 요청을 성공한다.', async () => {
    // given
    const requestDto = new RegisterRssRequestDto({
      blog: 'blog1',
      name: 'name1',
      email: 'test1@test.com',
      rssUrl: 'https://test.com/rss',
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedRss = await rssRepository.findOneBy({
      name: requestDto.blog,
      userName: requestDto.name,
      email: requestDto.email,
      rssUrl: requestDto.rssUrl,
    });

    // DB, Redis then
    expect(savedRss).not.toBeNull();

    // cleanup
    await rssRepository.delete(savedRss.id);
  });
});
