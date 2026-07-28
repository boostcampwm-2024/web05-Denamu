import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { Admin } from '@admin/entity/admin.entity';
import { AdminRepository } from '@admin/repository/admin.repository';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { NoticeStatus } from '@notice/constant/notice.constant';
import { Notice } from '@notice/entity/notice.entity';
import { NoticeRepository } from '@notice/repository/notice.repository';

import { AdminFixture } from '@test/config/common/fixture/admin.fixture';
import { NoticeFixture } from '@test/config/common/fixture/notice.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = (noticeId: number | string) => `/api/admins/notices/${noticeId}`;

describe(`GET /api/admins/notices/:id E2E Test`, () => {
  let agent: TestAgent;
  let redisService: RedisService;
  let adminRepository: AdminRepository;
  let noticeRepository: NoticeRepository;

  const sessionKey = 'admin-notice-detail-session-key';
  const redisKeyMake = (data: string) => `${REDIS_KEYS.ADMIN_AUTH_KEY}:${data}`;

  let admin: Admin;
  let draft: Notice;

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

    draft = await noticeRepository.save(
      NoticeFixture.createNoticeFixture({
        status: NoticeStatus.DRAFT,
        author: admin,
      }),
    );
  });

  it('[401] 관리자 세션 쿠키가 없을 경우 상세 조회를 실패한다.', async () => {
    // Http when
    const response = await agent.get(URL(draft.id));

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();
  });

  it('[200] 임시저장 상태의 공지사항도 상세 조회를 성공한다.', async () => {
    // Http when
    const response = await agent
      .get(URL(draft.id))
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    const { message, data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(message).toBe('공지사항 상세 조회를 성공했습니다.');
    expect(data).toMatchObject({
      id: draft.id,
      title: draft.title,
      content: draft.content,
      status: NoticeStatus.DRAFT,
      isPinned: false,
      authorName: admin.name,
    });
  });

  it('[404] 존재하지 않는 공지사항일 경우 상세 조회를 실패한다.', async () => {
    // Http when
    const response = await agent
      .get(URL(999999))
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[404] 공지사항 ID가 0일 경우 상세 조회를 실패한다.', async () => {
    // Http when
    const response = await agent
      .get(URL(0))
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[400] 공지사항 ID가 정수가 아닐 경우 상세 조회를 실패한다.', async () => {
    // Http when
    const response = await agent
      .get(URL('test'))
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });
});
