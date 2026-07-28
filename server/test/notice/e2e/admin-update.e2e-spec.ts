import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { AdminRepository } from '@admin/repository/admin.repository';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { NoticeStatus } from '@notice/constant/notice.constant';
import { UpdateNoticeRequestDto } from '@notice/dto/request/updateNotice.dto';
import { Notice } from '@notice/entity/notice.entity';
import { NoticeRepository } from '@notice/repository/notice.repository';

import { AdminFixture } from '@test/config/common/fixture/admin.fixture';
import { NoticeFixture } from '@test/config/common/fixture/notice.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = (noticeId: number | string) => `/api/admins/notices/${noticeId}`;

describe(`PATCH /api/admins/notices/:id E2E Test`, () => {
  let agent: TestAgent;
  let redisService: RedisService;
  let adminRepository: AdminRepository;
  let noticeRepository: NoticeRepository;

  const sessionKey = 'admin-notice-update-session-key';
  const redisKeyMake = (data: string) => `${REDIS_KEYS.ADMIN_AUTH_KEY}:${data}`;

  let notice: Notice;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    redisService = testApp.get(RedisService);
    adminRepository = testApp.get(AdminRepository);
    noticeRepository = testApp.get(NoticeRepository);
  });

  beforeEach(async () => {
    const admin = await adminRepository.save(
      await AdminFixture.createAdminCryptFixture(),
    );
    await redisService.set(redisKeyMake(sessionKey), admin.email);

    notice = await noticeRepository.save(
      NoticeFixture.createNoticeFixture({
        status: NoticeStatus.DRAFT,
        author: admin,
        startAt: new Date('2026-07-01T00:00:00.000Z'),
        endAt: new Date('2026-08-01T00:00:00.000Z'),
      }),
    );
  });

  it('[401] 관리자 세션 쿠키가 없을 경우 수정을 실패한다.', async () => {
    // given
    const requestDto = new UpdateNoticeRequestDto({ title: '수정된 제목' });

    // Http when
    const response = await agent.patch(URL(notice.id)).send(requestDto);

    // Http then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);

    // DB then
    const found = await noticeRepository.findOneBy({ id: notice.id });
    expect(found.title).toBe(notice.title);
  });

  it('[200] 제목만 수정할 경우 나머지 항목은 유지한 채 수정을 성공한다.', async () => {
    // given
    const requestDto = new UpdateNoticeRequestDto({ title: '수정된 제목' });

    // Http when
    const response = await agent
      .patch(URL(notice.id))
      .set('Cookie', `sessionId=${sessionKey}`)
      .send(requestDto);

    // Http then
    const { message, data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(message).toBe('공지사항이 성공적으로 수정되었습니다.');
    expect(data).toMatchObject({
      id: notice.id,
      title: '수정된 제목',
      content: notice.content,
      status: NoticeStatus.DRAFT,
      isPinned: false,
    });

    // DB then
    const found = await noticeRepository.findOneBy({ id: notice.id });
    expect(found.title).toBe('수정된 제목');
    expect(found.content).toBe(notice.content);
    expect(found.startAt).toStrictEqual(notice.startAt);
    expect(found.endAt).toStrictEqual(notice.endAt);
  });

  it('[200] 공개 상태와 상단 고정 여부를 수정할 경우 수정을 성공한다.', async () => {
    // given
    const requestDto = new UpdateNoticeRequestDto({
      status: NoticeStatus.PUBLISHED,
      isPinned: true,
    });

    // Http when
    const response = await agent
      .patch(URL(notice.id))
      .set('Cookie', `sessionId=${sessionKey}`)
      .send(requestDto);

    // Http then
    const { data } = response.body as {
      data: { status: NoticeStatus; isPinned: boolean };
    };
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.status).toBe(NoticeStatus.PUBLISHED);
    expect(data.isPinned).toBe(true);

    // DB then
    const found = await noticeRepository.findOneBy({ id: notice.id });
    expect(found.status).toBe(NoticeStatus.PUBLISHED);
    expect(found.isPinned).toBe(true);
  });

  it('[200] 본문과 노출 기간을 새로운 값으로 수정할 경우 수정을 성공한다.', async () => {
    // given
    const requestDto = new UpdateNoticeRequestDto({
      content: '<p>수정된 본문</p>',
      startAt: '2026-09-01T00:00:00.000Z',
      endAt: '2026-09-30T00:00:00.000Z',
    });

    // Http when
    const response = await agent
      .patch(URL(notice.id))
      .set('Cookie', `sessionId=${sessionKey}`)
      .send(requestDto);

    // Http then
    const { data } = response.body as { data: { content: string } };
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.content).toBe('<p>수정된 본문</p>');

    // DB then
    const found = await noticeRepository.findOneBy({ id: notice.id });
    expect(found.content).toBe('<p>수정된 본문</p>');
    expect(found.startAt).toStrictEqual(new Date(requestDto.startAt));
    expect(found.endAt).toStrictEqual(new Date(requestDto.endAt));
  });

  it('[200] 노출 기간을 null로 수정할 경우 노출 기간 제거를 성공한다.', async () => {
    // given
    const requestDto = new UpdateNoticeRequestDto({
      startAt: null,
      endAt: null,
    });

    // Http when
    const response = await agent
      .patch(URL(notice.id))
      .set('Cookie', `sessionId=${sessionKey}`)
      .send(requestDto);

    // Http then
    const { data } = response.body as {
      data: { startAt: string | null; endAt: string | null };
    };
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.startAt).toBeNull();
    expect(data.endAt).toBeNull();

    // DB then
    const found = await noticeRepository.findOneBy({ id: notice.id });
    expect(found.startAt).toBeNull();
    expect(found.endAt).toBeNull();
  });

  it('[400] 기존 종료일보다 늦은 시작일만 수정할 경우 수정을 실패한다.', async () => {
    // given
    const requestDto = new UpdateNoticeRequestDto({
      startAt: '2026-09-01T00:00:00.000Z',
    });

    // Http when
    const response = await agent
      .patch(URL(notice.id))
      .set('Cookie', `sessionId=${sessionKey}`)
      .send(requestDto);

    // Http then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);

    // DB then
    const found = await noticeRepository.findOneBy({ id: notice.id });
    expect(found.startAt).toStrictEqual(notice.startAt);
  });

  it('[400] 제목이 255자를 초과할 경우 수정을 실패한다.', async () => {
    // given
    const requestDto = new UpdateNoticeRequestDto({ title: 'a'.repeat(256) });

    // Http when
    const response = await agent
      .patch(URL(notice.id))
      .set('Cookie', `sessionId=${sessionKey}`)
      .send(requestDto);

    // Http then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);

    // DB then
    const found = await noticeRepository.findOneBy({ id: notice.id });
    expect(found.title).toBe(notice.title);
  });

  it('[400] 공지사항 ID가 1 미만일 경우 수정을 실패한다.', async () => {
    // given
    const requestDto = new UpdateNoticeRequestDto({ title: '수정된 제목' });

    // Http when
    const response = await agent
      .patch(URL(0))
      .set('Cookie', `sessionId=${sessionKey}`)
      .send(requestDto);

    // Http then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('[404] 존재하지 않는 공지사항일 경우 수정을 실패한다.', async () => {
    // given
    const requestDto = new UpdateNoticeRequestDto({ title: '수정된 제목' });

    // Http when
    const response = await agent
      .patch(URL(999999))
      .set('Cookie', `sessionId=${sessionKey}`)
      .send(requestDto);

    // Http then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });
});
