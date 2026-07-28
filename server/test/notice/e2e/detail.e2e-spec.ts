import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { Admin } from '@admin/entity/admin.entity';
import { AdminRepository } from '@admin/repository/admin.repository';

import { NoticeStatus } from '@notice/constant/notice.constant';
import { Notice } from '@notice/entity/notice.entity';
import { NoticeRepository } from '@notice/repository/notice.repository';

import { AdminFixture } from '@test/config/common/fixture/admin.fixture';
import { NoticeFixture } from '@test/config/common/fixture/notice.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = (noticeId: number | string) => `/api/notices/${noticeId}`;

const DAY = 24 * 60 * 60 * 1000;

describe(`GET /api/notices/:id E2E Test`, () => {
  let agent: TestAgent;
  let adminRepository: AdminRepository;
  let noticeRepository: NoticeRepository;

  let admin: Admin;
  let notice: Notice;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    adminRepository = testApp.get(AdminRepository);
    noticeRepository = testApp.get(NoticeRepository);
  });

  beforeEach(async () => {
    admin = await adminRepository.save(
      await AdminFixture.createAdminCryptFixture(),
    );
    notice = await noticeRepository.save(
      NoticeFixture.createNoticeFixture({ author: admin }),
    );
  });

  it('[200] 공개된 공지사항의 상세 조회를 성공한다.', async () => {
    // Http when
    const response = await agent.get(URL(notice.id));

    // Http then
    const { message, data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(message).toBe('공지사항 상세 조회를 성공했습니다.');
    expect(data).toMatchObject({
      id: notice.id,
      title: notice.title,
      content: notice.content,
      status: NoticeStatus.PUBLISHED,
      isPinned: false,
      startAt: null,
      endAt: null,
      authorName: admin.name,
    });
  });

  it('[404] 임시저장 상태의 공지사항일 경우 상세 조회를 실패한다.', async () => {
    // given
    const draft = await noticeRepository.save(
      NoticeFixture.createNoticeFixture({ status: NoticeStatus.DRAFT }),
    );

    // Http when
    const response = await agent.get(URL(draft.id));

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();
  });

  it('[404] 노출 시작 전인 공지사항일 경우 상세 조회를 실패한다.', async () => {
    // given
    const notStarted = await noticeRepository.save(
      NoticeFixture.createNoticeFixture({ startAt: new Date(Date.now() + DAY) }),
    );

    // Http when
    const response = await agent.get(URL(notStarted.id));

    // Http then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[404] 노출 기간이 종료된 공지사항일 경우 상세 조회를 실패한다.', async () => {
    // given
    const expired = await noticeRepository.save(
      NoticeFixture.createNoticeFixture({ endAt: new Date(Date.now() - DAY) }),
    );

    // Http when
    const response = await agent.get(URL(expired.id));

    // Http then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[404] 존재하지 않는 공지사항일 경우 상세 조회를 실패한다.', async () => {
    // Http when
    const response = await agent.get(URL(999999));

    // Http then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[400] 공지사항 ID가 1 미만일 경우 상세 조회를 실패한다.', async () => {
    // Http when
    const response = await agent.get(URL(0));

    // Http then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('[400] 공지사항 ID가 정수가 아닐 경우 상세 조회를 실패한다.', async () => {
    // Http when
    const response = await agent.get(URL('test'));

    // Http then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });
});
