import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { Admin } from '@admin/entity/admin.entity';
import { AdminRepository } from '@admin/repository/admin.repository';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { BoardStatus } from '@board/constant/board.constant';
import { Board } from '@board/entity/board.entity';
import { BoardRepository } from '@board/repository/board.repository';

import { AdminFixture } from '@test/config/common/fixture/admin.fixture';
import { BoardFixture } from '@test/config/common/fixture/board.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = (boardId: number | string) => `/api/admins/boards/${boardId}`;

describe(`GET /api/admins/boards/:id E2E Test`, () => {
  let agent: TestAgent;
  let redisService: RedisService;
  let adminRepository: AdminRepository;
  let boardRepository: BoardRepository;

  const sessionKey = 'admin-board-detail-session-key';
  const redisKeyMake = (data: string) => `${REDIS_KEYS.ADMIN_AUTH_KEY}:${data}`;

  let admin: Admin;
  let draft: Board;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    redisService = testApp.get(RedisService);
    adminRepository = testApp.get(AdminRepository);
    boardRepository = testApp.get(BoardRepository);
  });

  beforeEach(async () => {
    admin = await adminRepository.save(
      await AdminFixture.createAdminCryptFixture(),
    );
    await redisService.set(redisKeyMake(sessionKey), admin.email);

    draft = await boardRepository.save(
      BoardFixture.createBoardFixture({
        status: BoardStatus.DRAFT,
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

  it('[200] 임시저장 상태의 게시글도 상세 조회를 성공한다.', async () => {
    // Http when
    const response = await agent
      .get(URL(draft.id))
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    const { message, data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(message).toBe('게시글 상세 조회를 성공했습니다.');
    expect(data).toMatchObject({
      id: draft.id,
      title: draft.title,
      content: draft.content,
      status: BoardStatus.DRAFT,
      isPinned: false,
      authorName: admin.name,
    });
  });

  it('[404] 존재하지 않는 게시글일 경우 상세 조회를 실패한다.', async () => {
    // Http when
    const response = await agent
      .get(URL(999999))
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[404] 게시글 ID가 0일 경우 상세 조회를 실패한다.', async () => {
    // Http when
    const response = await agent
      .get(URL(0))
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[400] 게시글 ID가 정수가 아닐 경우 상세 조회를 실패한다.', async () => {
    // Http when
    const response = await agent
      .get(URL('test'))
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });
});
