import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { AdminRepository } from '@admin/repository/admin.repository';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { BoardStatus } from '@board/constant/board.constant';
import { UpdateBoardRequestDto } from '@board/dto/request/updateBoard.dto';
import { Board } from '@board/entity/board.entity';
import { BoardRepository } from '@board/repository/board.repository';

import { AdminFixture } from '@test/config/common/fixture/admin.fixture';
import { BoardFixture } from '@test/config/common/fixture/board.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = (boardId: number | string) => `/api/admins/boards/${boardId}`;

describe(`PATCH /api/admins/boards/:id E2E Test`, () => {
  let agent: TestAgent;
  let redisService: RedisService;
  let adminRepository: AdminRepository;
  let boardRepository: BoardRepository;

  const sessionKey = 'admin-board-update-session-key';
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
      BoardFixture.createBoardFixture({
        status: BoardStatus.DRAFT,
        author: admin,
        startAt: new Date('2026-07-01T00:00:00.000Z'),
        endAt: new Date('2026-08-01T00:00:00.000Z'),
      }),
    );
  });

  it('[401] 관리자 세션 쿠키가 없을 경우 수정을 실패한다.', async () => {
    // given
    const requestDto = new UpdateBoardRequestDto({ title: '수정된 제목' });

    // Http when
    const response = await agent.patch(URL(board.id)).send(requestDto);

    // Http then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);

    // DB then
    const found = await boardRepository.findOneBy({ id: board.id });
    expect(found.title).toBe(board.title);
  });

  it('[200] 제목만 수정할 경우 나머지 항목은 유지한 채 수정을 성공한다.', async () => {
    // given
    const requestDto = new UpdateBoardRequestDto({ title: '수정된 제목' });

    // Http when
    const response = await agent
      .patch(URL(board.id))
      .set('Cookie', `sessionId=${sessionKey}`)
      .send(requestDto);

    // Http then
    const { message, data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(message).toBe('게시글이 성공적으로 수정되었습니다.');
    expect(data).toMatchObject({
      id: board.id,
      title: '수정된 제목',
      content: board.content,
      status: BoardStatus.DRAFT,
      isPinned: false,
    });

    // DB then
    const found = await boardRepository.findOneBy({ id: board.id });
    expect(found.title).toBe('수정된 제목');
    expect(found.content).toBe(board.content);
    expect(found.startAt).toStrictEqual(board.startAt);
    expect(found.endAt).toStrictEqual(board.endAt);
  });

  it('[200] 공개 상태와 상단 고정 여부를 수정할 경우 수정을 성공한다.', async () => {
    // given
    const requestDto = new UpdateBoardRequestDto({
      status: BoardStatus.PUBLISHED,
      isPinned: true,
    });

    // Http when
    const response = await agent
      .patch(URL(board.id))
      .set('Cookie', `sessionId=${sessionKey}`)
      .send(requestDto);

    // Http then
    const { data } = response.body as {
      data: { status: BoardStatus; isPinned: boolean };
    };
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.status).toBe(BoardStatus.PUBLISHED);
    expect(data.isPinned).toBe(true);

    // DB then
    const found = await boardRepository.findOneBy({ id: board.id });
    expect(found.status).toBe(BoardStatus.PUBLISHED);
    expect(found.isPinned).toBe(true);
  });

  it('[200] 본문과 노출 기간을 새로운 값으로 수정할 경우 수정을 성공한다.', async () => {
    // given
    const requestDto = new UpdateBoardRequestDto({
      content: '<p>수정된 본문</p>',
      startAt: '2026-09-01T00:00:00.000Z',
      endAt: '2026-09-30T00:00:00.000Z',
    });

    // Http when
    const response = await agent
      .patch(URL(board.id))
      .set('Cookie', `sessionId=${sessionKey}`)
      .send(requestDto);

    // Http then
    const { data } = response.body as { data: { content: string } };
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.content).toBe('<p>수정된 본문</p>');

    // DB then
    const found = await boardRepository.findOneBy({ id: board.id });
    expect(found.content).toBe('<p>수정된 본문</p>');
    expect(found.startAt).toStrictEqual(new Date(requestDto.startAt));
    expect(found.endAt).toStrictEqual(new Date(requestDto.endAt));
  });

  it('[200] 노출 기간을 null로 수정할 경우 노출 기간 제거를 성공한다.', async () => {
    // given
    const requestDto = new UpdateBoardRequestDto({
      startAt: null,
      endAt: null,
    });

    // Http when
    const response = await agent
      .patch(URL(board.id))
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
    const found = await boardRepository.findOneBy({ id: board.id });
    expect(found.startAt).toBeNull();
    expect(found.endAt).toBeNull();
  });

  it('[400] 기존 종료일보다 늦은 시작일만 수정할 경우 수정을 실패한다.', async () => {
    // given
    const requestDto = new UpdateBoardRequestDto({
      startAt: '2026-09-01T00:00:00.000Z',
    });

    // Http when
    const response = await agent
      .patch(URL(board.id))
      .set('Cookie', `sessionId=${sessionKey}`)
      .send(requestDto);

    // Http then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);

    // DB then
    const found = await boardRepository.findOneBy({ id: board.id });
    expect(found.startAt).toStrictEqual(board.startAt);
  });

  it('[400] 제목이 255자를 초과할 경우 수정을 실패한다.', async () => {
    // given
    const requestDto = new UpdateBoardRequestDto({ title: 'a'.repeat(256) });

    // Http when
    const response = await agent
      .patch(URL(board.id))
      .set('Cookie', `sessionId=${sessionKey}`)
      .send(requestDto);

    // Http then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);

    // DB then
    const found = await boardRepository.findOneBy({ id: board.id });
    expect(found.title).toBe(board.title);
  });

  it('[400] 게시글 ID가 1 미만일 경우 수정을 실패한다.', async () => {
    // given
    const requestDto = new UpdateBoardRequestDto({ title: '수정된 제목' });

    // Http when
    const response = await agent
      .patch(URL(0))
      .set('Cookie', `sessionId=${sessionKey}`)
      .send(requestDto);

    // Http then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('[404] 존재하지 않는 게시글일 경우 수정을 실패한다.', async () => {
    // given
    const requestDto = new UpdateBoardRequestDto({ title: '수정된 제목' });

    // Http when
    const response = await agent
      .patch(URL(999999))
      .set('Cookie', `sessionId=${sessionKey}`)
      .send(requestDto);

    // Http then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });
});
