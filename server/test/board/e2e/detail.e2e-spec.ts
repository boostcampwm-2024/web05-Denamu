import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { Admin } from '@admin/entity/admin.entity';
import { AdminRepository } from '@admin/repository/admin.repository';

import { BoardStatus } from '@board/constant/board.constant';
import { Board } from '@board/entity/board.entity';
import { BoardRepository } from '@board/repository/board.repository';

import { AdminFixture } from '@test/config/common/fixture/admin.fixture';
import { BoardFixture } from '@test/config/common/fixture/board.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = (boardId: number | string) => `/api/boards/${boardId}`;

const DAY = 24 * 60 * 60 * 1000;

describe(`GET /api/boards/:id E2E Test`, () => {
  let agent: TestAgent;
  let adminRepository: AdminRepository;
  let boardRepository: BoardRepository;

  let admin: Admin;
  let board: Board;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    adminRepository = testApp.get(AdminRepository);
    boardRepository = testApp.get(BoardRepository);
  });

  beforeEach(async () => {
    admin = await adminRepository.save(
      await AdminFixture.createAdminCryptFixture(),
    );
    board = await boardRepository.save(
      BoardFixture.createBoardFixture({ author: admin }),
    );
  });

  it('[200] 공개된 게시글의 상세 조회를 성공한다.', async () => {
    // Http when
    const response = await agent.get(URL(board.id));

    // Http then
    const { message, data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(message).toBe('게시글 상세 조회를 성공했습니다.');
    expect(data).toMatchObject({
      id: board.id,
      title: board.title,
      content: board.content,
      status: BoardStatus.PUBLISHED,
      isPinned: false,
      startAt: null,
      endAt: null,
      authorName: admin.name,
    });
  });

  it('[404] 임시저장 상태의 게시글일 경우 상세 조회를 실패한다.', async () => {
    // given
    const draft = await boardRepository.save(
      BoardFixture.createBoardFixture({ status: BoardStatus.DRAFT }),
    );

    // Http when
    const response = await agent.get(URL(draft.id));

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();
  });

  it('[404] 노출 시작 전인 게시글일 경우 상세 조회를 실패한다.', async () => {
    // given
    const notStarted = await boardRepository.save(
      BoardFixture.createBoardFixture({ startAt: new Date(Date.now() + DAY) }),
    );

    // Http when
    const response = await agent.get(URL(notStarted.id));

    // Http then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[404] 노출 기간이 종료된 게시글일 경우 상세 조회를 실패한다.', async () => {
    // given
    const expired = await boardRepository.save(
      BoardFixture.createBoardFixture({ endAt: new Date(Date.now() - DAY) }),
    );

    // Http when
    const response = await agent.get(URL(expired.id));

    // Http then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[404] 존재하지 않는 게시글일 경우 상세 조회를 실패한다.', async () => {
    // Http when
    const response = await agent.get(URL(999999));

    // Http then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[400] 게시글 ID가 1 미만일 경우 상세 조회를 실패한다.', async () => {
    // Http when
    const response = await agent.get(URL(0));

    // Http then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('[400] 게시글 ID가 정수가 아닐 경우 상세 조회를 실패한다.', async () => {
    // Http when
    const response = await agent.get(URL('test'));

    // Http then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });
});
