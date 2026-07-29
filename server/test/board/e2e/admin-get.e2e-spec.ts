import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { AdminRepository } from '@admin/repository/admin.repository';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { BoardCategory, BoardStatus } from '@board/constant/board.constant';
import { Board } from '@board/entity/board.entity';
import { BoardRepository } from '@board/repository/board.repository';

import { AdminFixture } from '@test/config/common/fixture/admin.fixture';
import { BoardFixture } from '@test/config/common/fixture/board.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/admins/boards';

const DAY = 24 * 60 * 60 * 1000;

type BoardListResponseBody = {
  message: string;
  data: {
    page: number;
    limit: number;
    totalCount: number;
    hasMore: boolean;
    result: { id: number }[];
  };
};

describe(`GET ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let redisService: RedisService;
  let adminRepository: AdminRepository;
  let boardRepository: BoardRepository;

  const sessionKey = 'admin-board-get-session-key';
  const redisKeyMake = (data: string) => `${REDIS_KEYS.ADMIN_AUTH_KEY}:${data}`;

  let draft: Board;
  let expired: Board;
  let pinned: Board;

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

    draft = await boardRepository.save(
      BoardFixture.createBoardFixture({ status: BoardStatus.DRAFT }),
    );
    expired = await boardRepository.save(
      BoardFixture.createBoardFixture({ endAt: new Date(Date.now() - DAY) }),
    );
    pinned = await boardRepository.save(
      BoardFixture.createBoardFixture({ isPinned: true }),
    );
  });

  it('[401] 관리자 세션 쿠키가 없을 경우 목록 조회를 실패한다.', async () => {
    // Http when
    const response = await agent.get(URL);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();
  });

  it('[200] 쿼리 파라미터가 없을 경우 기본 페이지네이션으로 임시저장과 노출 종료 공지까지 조회를 성공한다.', async () => {
    // Http when
    const response = await agent
      .get(URL)
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    const { message, data } = response.body as BoardListResponseBody;
    expect(response.status).toBe(HttpStatus.OK);
    expect(message).toBe('게시글 목록 조회를 성공했습니다.');
    expect(data.page).toBe(1);
    expect(data.limit).toBe(10);
    expect(data.totalCount).toBe(3);
    expect(data.hasMore).toBe(false);
    expect(data.result.map((board) => board.id).sort()).toStrictEqual(
      [draft.id, expired.id, pinned.id].sort(),
    );
  });

  it('[200] 상단 고정 게시글이 목록 최상단으로 정렬되어 조회를 성공한다.', async () => {
    // Http when
    const response = await agent
      .get(URL)
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    const { data } = response.body as BoardListResponseBody;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.result[0].id).toBe(pinned.id);
  });

  it('[200] status 필터를 입력할 경우 해당 공개 상태의 게시글만 조회를 성공한다.', async () => {
    // Http when
    const response = await agent
      .get(URL)
      .query({ status: BoardStatus.DRAFT })
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    const { data } = response.body as BoardListResponseBody;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.totalCount).toBe(1);
    expect(data.result).toHaveLength(1);
    expect(data.result[0].id).toBe(draft.id);
  });

  it('[200] 페이지네이션을 입력할 경우 해당 페이지 조회를 성공한다.', async () => {
    // Http when
    const response = await agent
      .get(URL)
      .query({ page: 1, limit: 2 })
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    const { data } = response.body as BoardListResponseBody;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.result).toHaveLength(2);
    expect(data.hasMore).toBe(true);
  });

  it('[400] page가 1 미만일 경우 목록 조회를 실패한다.', async () => {
    // Http when
    const response = await agent
      .get(URL)
      .query({ page: 0 })
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('[400] status가 공개 상태 목록에 없는 값일 경우 목록 조회를 실패한다.', async () => {
    // Http when
    const response = await agent
      .get(URL)
      .query({ status: 'DELETED' })
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('[200] category 필터를 입력할 경우 해당 분류의 게시글만 조회를 성공한다.', async () => {
    // given
    const faq = await boardRepository.save(
      BoardFixture.createBoardFixture({ category: BoardCategory.FAQ }),
    );

    // Http when
    const response = await agent
      .get(URL)
      .query({ category: BoardCategory.FAQ })
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    const { data } = response.body as BoardListResponseBody;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.totalCount).toBe(1);
    expect(data.result).toHaveLength(1);
    expect(data.result[0].id).toBe(faq.id);
  });

  it('[400] category가 분류 목록에 없는 값일 경우 목록 조회를 실패한다.', async () => {
    // Http when
    const response = await agent
      .get(URL)
      .query({ category: 'EVENT' })
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });
});
