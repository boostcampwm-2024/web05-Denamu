import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { NoticeStatus } from '@notice/constant/notice.constant';
import { Notice } from '@notice/entity/notice.entity';
import { NoticeRepository } from '@notice/repository/notice.repository';

import { NoticeFixture } from '@test/config/common/fixture/notice.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/notices';

const DAY = 24 * 60 * 60 * 1000;

type NoticeListResponseBody = {
  message: string;
  data: {
    page: number;
    limit: number;
    totalCount: number;
    hasMore: boolean;
    result: { id: number; isPinned: boolean }[];
  };
};

describe(`GET ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let noticeRepository: NoticeRepository;

  let published: Notice;
  let pinned: Notice;
  let inWindow: Notice;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    noticeRepository = testApp.get(NoticeRepository);
  });

  beforeEach(async () => {
    const now = Date.now();

    published = await noticeRepository.save(NoticeFixture.createNoticeFixture());
    inWindow = await noticeRepository.save(
      NoticeFixture.createNoticeFixture({
        startAt: new Date(now - DAY),
        endAt: new Date(now + DAY),
      }),
    );
    pinned = await noticeRepository.save(
      NoticeFixture.createNoticeFixture({ isPinned: true }),
    );
    await noticeRepository.save(
      NoticeFixture.createNoticeFixture({ status: NoticeStatus.DRAFT }),
    );
    await noticeRepository.save(
      NoticeFixture.createNoticeFixture({ startAt: new Date(now + DAY) }),
    );
    await noticeRepository.save(
      NoticeFixture.createNoticeFixture({ endAt: new Date(now - DAY) }),
    );
  });

  it('[200] 쿼리 파라미터가 없을 경우 기본 페이지네이션으로 목록 조회를 성공한다.', async () => {
    // Http when
    const response = await agent.get(URL);

    // Http then
    const { message, data } = response.body as NoticeListResponseBody;
    expect(response.status).toBe(HttpStatus.OK);
    expect(message).toBe('공지사항 목록 조회를 성공했습니다.');
    expect(data.page).toBe(1);
    expect(data.limit).toBe(10);
    expect(data.totalCount).toBe(3);
    expect(data.hasMore).toBe(false);
    expect(data.result).toHaveLength(3);
  });

  it('[200] 공개 상태와 노출 기간을 만족하는 공지사항만 목록 조회를 성공한다.', async () => {
    // Http when
    const response = await agent.get(URL);

    // Http then
    const { data } = response.body as NoticeListResponseBody;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.result.map((notice) => notice.id).sort()).toStrictEqual(
      [published.id, inWindow.id, pinned.id].sort(),
    );
  });

  it('[200] 상단 고정 공지사항이 목록 최상단으로 정렬되어 조회를 성공한다.', async () => {
    // Http when
    const response = await agent.get(URL);

    // Http then
    const { data } = response.body as NoticeListResponseBody;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.result[0].id).toBe(pinned.id);
    expect(data.result[0].isPinned).toBe(true);
    expect(data.result[1].id).toBe(inWindow.id);
    expect(data.result[2].id).toBe(published.id);
  });

  it('[200] 목록 조회 시 본문을 제외한 요약 정보 반환을 성공한다.', async () => {
    // Http when
    const response = await agent.get(URL);

    // Http then
    const { data } = response.body as NoticeListResponseBody;
    expect(response.status).toBe(HttpStatus.OK);
    expect(Object.keys(data.result[0]).sort()).toStrictEqual(
      ['createdAt', 'endAt', 'id', 'isPinned', 'startAt', 'status', 'title'].sort(),
    );
  });

  it('[200] limit보다 많은 공지사항이 존재할 경우 hasMore가 true로 조회를 성공한다.', async () => {
    // Http when
    const response = await agent.get(URL).query({ page: 1, limit: 2 });

    // Http then
    const { data } = response.body as NoticeListResponseBody;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.result).toHaveLength(2);
    expect(data.totalCount).toBe(3);
    expect(data.hasMore).toBe(true);
  });

  it('[200] 마지막 페이지를 요청할 경우 hasMore가 false로 조회를 성공한다.', async () => {
    // Http when
    const response = await agent.get(URL).query({ page: 2, limit: 2 });

    // Http then
    const { data } = response.body as NoticeListResponseBody;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.result).toHaveLength(1);
    expect(data.result[0].id).toBe(published.id);
    expect(data.hasMore).toBe(false);
  });

  it('[400] page가 1 미만일 경우 목록 조회를 실패한다.', async () => {
    // Http when
    const response = await agent.get(URL).query({ page: 0 });

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(data).toBeUndefined();
  });

  it('[400] limit이 정수가 아닐 경우 목록 조회를 실패한다.', async () => {
    // Http when
    const response = await agent.get(URL).query({ limit: 'test' });

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(data).toBeUndefined();
  });
});
