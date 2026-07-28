import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { Admin } from '@admin/entity/admin.entity';
import { AdminRepository } from '@admin/repository/admin.repository';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { NoticeStatus } from '@notice/constant/notice.constant';
import { CreateNoticeRequestDto } from '@notice/dto/request/createNotice.dto';
import { NoticeRepository } from '@notice/repository/notice.repository';

import { AdminFixture } from '@test/config/common/fixture/admin.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/admins/notices';

describe(`POST ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let redisService: RedisService;
  let adminRepository: AdminRepository;
  let noticeRepository: NoticeRepository;

  const sessionKey = 'admin-notice-create-session-key';
  const redisKeyMake = (data: string) => `${REDIS_KEYS.ADMIN_AUTH_KEY}:${data}`;

  let admin: Admin;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    redisService = testApp.get(RedisService);
    adminRepository = testApp.get(AdminRepository);
    noticeRepository = testApp.get(NoticeRepository);
  });

  beforeEach(async () => {
    admin = await adminRepository.save(
      await AdminFixture.createAdminCryptFixture(),
    );
    await redisService.set(redisKeyMake(sessionKey), admin.email);
  });

  it('[401] 관리자 세션 쿠키가 없을 경우 작성을 실패한다.', async () => {
    // given
    const requestDto = new CreateNoticeRequestDto({
      title: '서비스 점검 안내',
      content: '<p>본문</p>',
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);

    // DB then
    expect(await noticeRepository.count()).toBe(0);
  });

  it('[201] 선택 항목 없이 제목과 본문만 입력할 경우 임시저장 상태로 작성을 성공한다.', async () => {
    // given
    const requestDto = new CreateNoticeRequestDto({
      title: '서비스 점검 안내',
      content: '<p>본문</p>',
    });

    // Http when
    const response = await agent
      .post(URL)
      .set('Cookie', `sessionId=${sessionKey}`)
      .send(requestDto);

    // Http then
    const { message, data } = response.body as {
      message: string;
      data: { id: number };
    };
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(message).toBe('공지사항이 성공적으로 작성되었습니다.');
    expect(data).toMatchObject({
      title: requestDto.title,
      content: requestDto.content,
      status: NoticeStatus.DRAFT,
      isPinned: false,
      startAt: null,
      endAt: null,
      authorName: admin.name,
    });

    // DB then
    const saved = await noticeRepository.findOne({
      where: { id: data.id },
      relations: ['author'],
    });
    expect(saved.title).toBe(requestDto.title);
    expect(saved.status).toBe(NoticeStatus.DRAFT);
    expect(saved.isPinned).toBe(false);
    expect(saved.author.id).toBe(admin.id);
  });

  it('[201] 공개 상태와 노출 기간을 입력할 경우 입력한 값으로 작성을 성공한다.', async () => {
    // given
    const requestDto = new CreateNoticeRequestDto({
      title: '서비스 점검 안내',
      content: '<p>본문</p>',
      status: NoticeStatus.PUBLISHED,
      isPinned: true,
      startAt: '2026-08-01T00:00:00.000Z',
      endAt: '2026-08-31T00:00:00.000Z',
    });

    // Http when
    const response = await agent
      .post(URL)
      .set('Cookie', `sessionId=${sessionKey}`)
      .send(requestDto);

    // Http then
    const { data } = response.body as {
      data: { id: number; status: NoticeStatus; isPinned: boolean };
    };
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(data.status).toBe(NoticeStatus.PUBLISHED);
    expect(data.isPinned).toBe(true);

    // DB then
    const saved = await noticeRepository.findOneBy({ id: data.id });
    expect(saved.startAt).toStrictEqual(new Date(requestDto.startAt));
    expect(saved.endAt).toStrictEqual(new Date(requestDto.endAt));
  });

  it('[400] 노출 시작일이 종료일과 같을 경우 작성을 실패한다.', async () => {
    // given
    const requestDto = new CreateNoticeRequestDto({
      title: '서비스 점검 안내',
      content: '<p>본문</p>',
      startAt: '2026-08-01T00:00:00.000Z',
      endAt: '2026-08-01T00:00:00.000Z',
    });

    // Http when
    const response = await agent
      .post(URL)
      .set('Cookie', `sessionId=${sessionKey}`)
      .send(requestDto);

    // Http then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);

    // DB then
    expect(await noticeRepository.count()).toBe(0);
  });

  it('[400] 노출 시작일이 종료일보다 늦을 경우 작성을 실패한다.', async () => {
    // given
    const requestDto = new CreateNoticeRequestDto({
      title: '서비스 점검 안내',
      content: '<p>본문</p>',
      startAt: '2026-09-01T00:00:00.000Z',
      endAt: '2026-08-01T00:00:00.000Z',
    });

    // Http when
    const response = await agent
      .post(URL)
      .set('Cookie', `sessionId=${sessionKey}`)
      .send(requestDto);

    // Http then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);

    // DB then
    expect(await noticeRepository.count()).toBe(0);
  });

  it('[400] 제목이 255자를 초과할 경우 작성을 실패한다.', async () => {
    // given
    const requestDto = new CreateNoticeRequestDto({
      title: 'a'.repeat(256),
      content: '<p>본문</p>',
    });

    // Http when
    const response = await agent
      .post(URL)
      .set('Cookie', `sessionId=${sessionKey}`)
      .send(requestDto);

    // Http then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);

    // DB then
    expect(await noticeRepository.count()).toBe(0);
  });

  it('[400] 본문이 없을 경우 작성을 실패한다.', async () => {
    // given
    const requestDto = new CreateNoticeRequestDto({
      title: '서비스 점검 안내',
    });

    // Http when
    const response = await agent
      .post(URL)
      .set('Cookie', `sessionId=${sessionKey}`)
      .send(requestDto);

    // Http then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);

    // DB then
    expect(await noticeRepository.count()).toBe(0);
  });

  it('[400] 공개 상태가 공개 상태 목록에 없는 값일 경우 작성을 실패한다.', async () => {
    // given
    const requestDto = {
      title: '서비스 점검 안내',
      content: '<p>본문</p>',
      status: 'DELETED',
    };

    // Http when
    const response = await agent
      .post(URL)
      .set('Cookie', `sessionId=${sessionKey}`)
      .send(requestDto);

    // Http then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);

    // DB then
    expect(await noticeRepository.count()).toBe(0);
  });
});
