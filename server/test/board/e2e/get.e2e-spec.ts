import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { BoardCategory, BoardStatus } from '@board/constant/board.constant';
import { Board } from '@board/entity/board.entity';
import { BoardRepository } from '@board/repository/board.repository';

import { BoardFixture } from '@test/config/common/fixture/board.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/boards';

const DAY = 24 * 60 * 60 * 1000;

type BoardListResponseBody = {
  message: string;
  data: {
    page: number;
    limit: number;
    totalCount: number;
    hasMore: boolean;
    result: { id: number; isPinned: boolean }[];
  };
};

describe(`GET ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let boardRepository: BoardRepository;

  let published: Board;
  let pinned: Board;
  let inWindow: Board;
  let faq: Board;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    boardRepository = testApp.get(BoardRepository);
  });

  beforeEach(async () => {
    const now = Date.now();

    published = await boardRepository.save(BoardFixture.createBoardFixture());
    inWindow = await boardRepository.save(
      BoardFixture.createBoardFixture({
        startAt: new Date(now - DAY),
        endAt: new Date(now + DAY),
      }),
    );
    pinned = await boardRepository.save(
      BoardFixture.createBoardFixture({ isPinned: true }),
    );
    await boardRepository.save(
      BoardFixture.createBoardFixture({ status: BoardStatus.DRAFT }),
    );
    await boardRepository.save(
      BoardFixture.createBoardFixture({ startAt: new Date(now + DAY) }),
    );
    await boardRepository.save(
      BoardFixture.createBoardFixture({ endAt: new Date(now - DAY) }),
    );
    faq = await boardRepository.save(
      BoardFixture.createBoardFixture({ category: BoardCategory.FAQ }),
    );
  });

  it('[200] 쿼리 파라미터가 없을 경우 기본 페이지네이션으로 목록 조회를 성공한다.', async () => {
    // Http when
    const response = await agent.get(URL);

    // Http then
    const { message, data } = response.body as BoardListResponseBody;
    expect(response.status).toBe(HttpStatus.OK);
    expect(message).toBe('게시글 목록 조회를 성공했습니다.');
    expect(data.page).toBe(1);
    expect(data.limit).toBe(10);
    expect(data.totalCount).toBe(3);
    expect(data.hasMore).toBe(false);
    expect(data.result).toHaveLength(3);
  });

  it('[200] 공개 상태와 노출 기간을 만족하는 게시글만 목록 조회를 성공한다.', async () => {
    // Http when
    const response = await agent.get(URL);

    // Http then
    const { data } = response.body as BoardListResponseBody;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.result.map((board) => board.id).sort()).toStrictEqual(
      [published.id, inWindow.id, pinned.id].sort(),
    );
  });

  it('[200] 상단 고정 게시글이 목록 최상단으로 정렬되어 조회를 성공한다.', async () => {
    // Http when
    const response = await agent.get(URL);

    // Http then
    const { data } = response.body as BoardListResponseBody;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.result[0].id).toBe(pinned.id);
    expect(data.result[0].isPinned).toBe(true);
    expect(data.result[1].id).toBe(inWindow.id);
    expect(data.result[2].id).toBe(published.id);
  });

  it('[200] 목록 조회 시 본문을 제외한 요약 정보 반환을 성공한다.', async () => {
    // Http when
    const response = await agent.get(URL);

    // Http then
    const { data } = response.body as BoardListResponseBody;
    expect(response.status).toBe(HttpStatus.OK);
    expect(Object.keys(data.result[0]).sort()).toStrictEqual(
      ['category', 'createdAt', 'endAt', 'id', 'isPinned', 'startAt', 'status', 'title'].sort(),
    );
  });

  it('[200] limit보다 많은 게시글이 존재할 경우 hasMore가 true로 조회를 성공한다.', async () => {
    // Http when
    const response = await agent.get(URL).query({ page: 1, limit: 2 });

    // Http then
    const { data } = response.body as BoardListResponseBody;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.result).toHaveLength(2);
    expect(data.totalCount).toBe(3);
    expect(data.hasMore).toBe(true);
  });

  it('[200] 마지막 페이지를 요청할 경우 hasMore가 false로 조회를 성공한다.', async () => {
    // Http when
    const response = await agent.get(URL).query({ page: 2, limit: 2 });

    // Http then
    const { data } = response.body as BoardListResponseBody;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.result).toHaveLength(1);
    expect(data.result[0].id).toBe(published.id);
    expect(data.hasMore).toBe(false);
  });

  it('[400] page가 1 미만일 경우 목록 조회를 실패한다.', async () => {
    // Http when
    const response = await agent.get(URL).query({ page: 0 });

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(data).toBeUndefined();
  });

  it('[400] limit이 정수가 아닐 경우 목록 조회를 실패한다.', async () => {
    // Http when
    const response = await agent.get(URL).query({ limit: 'test' });

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(data).toBeUndefined();
  });

  it('[200] 분류를 지정하지 않을 경우 FAQ를 제외한 일반 게시글만 조회를 성공한다.', async () => {
    // Http when
    const response = await agent.get(URL);

    // Http then
    const { data } = response.body as BoardListResponseBody;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.result.map((board) => board.id)).not.toContain(faq.id);
  });

  it('[200] category=FAQ로 조회할 경우 FAQ 게시글만 조회를 성공한다.', async () => {
    // Http when
    const response = await agent.get(URL).query({ category: BoardCategory.FAQ });

    // Http then
    const { data } = response.body as BoardListResponseBody;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data.totalCount).toBe(1);
    expect(data.result).toHaveLength(1);
    expect(data.result[0].id).toBe(faq.id);
  });

  it('[400] category가 분류 목록에 없는 값일 경우 목록 조회를 실패한다.', async () => {
    // Http when
    const response = await agent.get(URL).query({ category: 'EVENT' });

    // Http then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });
});
