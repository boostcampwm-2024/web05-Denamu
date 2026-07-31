import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { AdminRepository } from '@admin/repository/admin.repository';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { Board } from '@board/entity/board.entity';
import { BoardRepository } from '@board/repository/board.repository';

import { AdminFixture } from '@test/config/common/fixture/admin.fixture';
import { BoardFixture } from '@test/config/common/fixture/board.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = (boardId: number | string) => `/api/admins/boards/${boardId}`;

describe(`DELETE /api/admins/boards/:id E2E Test`, () => {
  let agent: TestAgent;
  let redisService: RedisService;
  let adminRepository: AdminRepository;
  let boardRepository: BoardRepository;

  const sessionKey = 'admin-board-delete-session-key';
  const redisKeyMake = (data: string) => `${REDIS_KEYS.ADMIN_AUTH_KEY}:${data}`;

  let board: Board;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    redisService = testApp.get(RedisService);
    adminRepository = testApp.get(AdminRepository);
    boardRepository = testApp.get(BoardRepository);
  });

  beforeEach(async () => {
    const admin = await adminRepository.save(
      await AdminFixture.createAdminCryptFixture(),
    );
    await redisService.set(redisKeyMake(sessionKey), admin.email);

    board = await boardRepository.save(
      BoardFixture.createBoardFixture({ author: admin }),
    );
  });

  it('[401] 관리자 세션 쿠키가 없을 경우 삭제를 실패한다.', async () => {
    // Http when
    const response = await agent.delete(URL(board.id));

    // Http then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);

    // DB then
    expect(await boardRepository.findOneBy({ id: board.id })).not.toBeNull();
  });

  it('[200] 게시글 삭제를 성공한다.', async () => {
    // Http when
    const response = await agent
      .delete(URL(board.id))
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    const { message, data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(message).toBe('게시글이 성공적으로 삭제되었습니다.');
    expect(data).toBeUndefined();

    // DB then
    expect(await boardRepository.findOneBy({ id: board.id })).toBeNull();
  });

  it('[404] 존재하지 않는 게시글일 경우 삭제를 실패한다.', async () => {
    // Http when
    const response = await agent
      .delete(URL(999999))
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);

    // DB then
    expect(await boardRepository.findOneBy({ id: board.id })).not.toBeNull();
  });
});
