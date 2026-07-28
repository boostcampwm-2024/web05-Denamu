import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { AdminRepository } from '@admin/repository/admin.repository';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { Notice } from '@notice/entity/notice.entity';
import { NoticeRepository } from '@notice/repository/notice.repository';

import { AdminFixture } from '@test/config/common/fixture/admin.fixture';
import { NoticeFixture } from '@test/config/common/fixture/notice.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = (noticeId: number | string) => `/api/admins/notices/${noticeId}`;

describe(`DELETE /api/admins/notices/:id E2E Test`, () => {
  let agent: TestAgent;
  let redisService: RedisService;
  let adminRepository: AdminRepository;
  let noticeRepository: NoticeRepository;

  const sessionKey = 'admin-notice-delete-session-key';
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
      NoticeFixture.createNoticeFixture({ author: admin }),
    );
  });

  it('[401] 관리자 세션 쿠키가 없을 경우 삭제를 실패한다.', async () => {
    // Http when
    const response = await agent.delete(URL(notice.id));

    // Http then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);

    // DB then
    expect(await noticeRepository.findOneBy({ id: notice.id })).not.toBeNull();
  });

  it('[200] 공지사항 삭제를 성공한다.', async () => {
    // Http when
    const response = await agent
      .delete(URL(notice.id))
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    const { message, data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(message).toBe('공지사항이 성공적으로 삭제되었습니다.');
    expect(data).toBeUndefined();

    // DB then
    expect(await noticeRepository.findOneBy({ id: notice.id })).toBeNull();
  });

  it('[404] 존재하지 않는 공지사항일 경우 삭제를 실패한다.', async () => {
    // Http when
    const response = await agent
      .delete(URL(999999))
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);

    // DB then
    expect(await noticeRepository.findOneBy({ id: notice.id })).not.toBeNull();
  });

  it('[400] 공지사항 ID가 정수가 아닐 경우 삭제를 실패한다.', async () => {
    // Http when
    const response = await agent
      .delete(URL('test'))
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);

    // DB then
    expect(await noticeRepository.findOneBy({ id: notice.id })).not.toBeNull();
  });
});
