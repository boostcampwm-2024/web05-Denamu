import 'reflect-metadata';

import { DatabaseConnection } from '@common/database/database-connection';
import { FeedDetail } from '@common/feed/feed.type';
import { DbMetrics } from '@common/metrics/db-metrics';
import { RedisMetrics } from '@common/metrics/redis-metrics';
import { RedisConnection } from '@common/redis/redis-access';

import { FeedRepository } from '@repository/feed.repository';

describe('FeedRepository', () => {
  let feedRepository: FeedRepository;
  let mockDbConnection: jest.Mocked<DatabaseConnection>;
  let mockDbMetrics: jest.Mocked<DbMetrics>;
  let executeQueryStrictMock: jest.Mock<Promise<any>, [string, any[]]>;
  let totalIncMock: jest.Mock;
  let successIncMock: jest.Mock;
  let failureIncMock: jest.Mock;
  let duplicateIncMock: jest.Mock;

  const INSERT_LABEL = { operation: 'insert_feed' };

  const createFeed = (id: number): FeedDetail => ({
    id,
    blogId: id,
    pubDate: `2024-01-01 12:0${id}:00`,
    title: `테스트 피드 ${id}`,
    link: `https://test${id}.tistory.com/${id}`,
    thumbnail: `https://test${id}.tistory.com/image${id}.jpg`,
    content: `테스트 내용 ${id}`,
    summary: 'AI 요약 처리 중...',
    deathCount: 0,
  });

  const toValueRow = (feed: FeedDetail) => [
    feed.blogId,
    feed.pubDate,
    feed.title,
    feed.link,
    feed.thumbnail,
    feed.summary,
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    executeQueryStrictMock = jest.fn();
    totalIncMock = jest.fn();
    successIncMock = jest.fn();
    failureIncMock = jest.fn();
    duplicateIncMock = jest.fn();

    mockDbConnection = {
      executeQuery: jest.fn(),
      executeQueryStrict: executeQueryStrictMock,
    };

    mockDbMetrics = {
      total: { inc: totalIncMock },
      success: { inc: successIncMock },
      failure: { inc: failureIncMock },
      duplicate: { inc: duplicateIncMock },
    } as any;

    feedRepository = new FeedRepository(
      mockDbConnection,
      {} as RedisConnection,
      mockDbMetrics,
      {} as RedisMetrics,
    );
  });

  describe('insertFeeds', () => {
    it('모든 피드가 신규일 때 선조회 → INSERT → 재조회 순으로 실행하고 재조회한 id를 붙여 전부 반환해야 한다', async () => {
      // GIVEN: 선조회 결과가 비어 있어 입력 전체가 삽입 후보가 된다
      const feeds = [createFeed(1), createFeed(2)];
      executeQueryStrictMock
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce([
          { id: 101, path: feeds[0].link },
          { id: 102, path: feeds[1].link },
        ]);

      // WHEN
      const result = await feedRepository.insertFeeds(feeds);

      // THEN: 선조회 1회 + 다중 행 INSERT 1회 + 재조회 1회여야 한다
      expect(result).toEqual([
        { ...feeds[0], id: 101 },
        { ...feeds[1], id: 102 },
      ]);
      expect(executeQueryStrictMock).toHaveBeenCalledTimes(3);
      expect(executeQueryStrictMock).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('SELECT path FROM feed'),
        [[feeds[0].link, feeds[1].link]],
      );
      expect(executeQueryStrictMock).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('INSERT IGNORE INTO feed'),
        [[toValueRow(feeds[0]), toValueRow(feeds[1])]],
      );
      expect(executeQueryStrictMock).toHaveBeenNthCalledWith(
        3,
        expect.stringContaining('SELECT id, path FROM feed'),
        [[feeds[0].link, feeds[1].link]],
      );
      expect(totalIncMock).toHaveBeenCalledWith(INSERT_LABEL, 2);
      expect(successIncMock).toHaveBeenCalledWith(INSERT_LABEL, 2);
      expect(duplicateIncMock).not.toHaveBeenCalled();
      expect(failureIncMock).not.toHaveBeenCalled();
    });

    it('이전 사이클에 이미 저장된 path는 INSERT 후보에서 제외하고 duplicate로 집계해야 한다', async () => {
      // GIVEN: 2번 피드는 선조회에서 이미 존재하는 것으로 확인된다
      const feeds = [createFeed(1), createFeed(2), createFeed(3)];
      executeQueryStrictMock
        .mockResolvedValueOnce([{ path: feeds[1].link }])
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce([
          { id: 103, path: feeds[2].link },
          { id: 101, path: feeds[0].link },
        ]);

      // WHEN
      const result = await feedRepository.insertFeeds(feeds);

      // THEN: 재조회 반환 순서가 아닌 원본 입력 순서를 유지해야 한다
      expect(result).toEqual([
        { ...feeds[0], id: 101 },
        { ...feeds[2], id: 103 },
      ]);

      const insertValues = executeQueryStrictMock.mock.calls[1][1][0];
      expect(insertValues).toHaveLength(2);
      expect(insertValues).toEqual([toValueRow(feeds[0]), toValueRow(feeds[2])]);
      // 기존 path는 INSERT에도 재조회에도 실려서는 안 된다
      expect(executeQueryStrictMock).toHaveBeenNthCalledWith(
        3,
        expect.stringContaining('SELECT id, path FROM feed'),
        [[feeds[0].link, feeds[2].link]],
      );
      expect(totalIncMock).toHaveBeenCalledWith(INSERT_LABEL, 3);
      expect(successIncMock).toHaveBeenCalledWith(INSERT_LABEL, 2);
      expect(duplicateIncMock).toHaveBeenCalledWith(1);
      expect(failureIncMock).not.toHaveBeenCalled();
    });

    it('모든 피드가 이미 저장되어 있으면 INSERT와 재조회를 실행하지 않고 빈 배열을 반환해야 한다', async () => {
      // GIVEN: 선조회가 입력 전체를 이미 존재하는 path로 반환한다
      const feeds = [createFeed(1), createFeed(2)];
      executeQueryStrictMock.mockResolvedValueOnce([
        { path: feeds[0].link },
        { path: feeds[1].link },
      ]);

      // WHEN
      const result = await feedRepository.insertFeeds(feeds);

      // THEN
      expect(result).toEqual([]);
      expect(executeQueryStrictMock).toHaveBeenCalledTimes(1);
      expect(executeQueryStrictMock).toHaveBeenCalledWith(
        expect.stringContaining('SELECT path FROM feed'),
        [[feeds[0].link, feeds[1].link]],
      );
      expect(totalIncMock).toHaveBeenCalledWith(INSERT_LABEL, 2);
      expect(successIncMock).toHaveBeenCalledWith(INSERT_LABEL, 0);
      expect(duplicateIncMock).toHaveBeenCalledWith(2);
      expect(failureIncMock).not.toHaveBeenCalled();
    });

    it('INSERT IGNORE로 스킵되어 재조회에 잡히지 않은 후보는 결과에서 제외하고 duplicate로 집계해야 한다', async () => {
      // GIVEN: 후보 3건 중 2번 피드가 재조회 결과에 없다
      const feeds = [createFeed(1), createFeed(2), createFeed(3)];
      executeQueryStrictMock
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce([
          { id: 101, path: feeds[0].link },
          { id: 103, path: feeds[2].link },
        ]);

      // WHEN
      const result = await feedRepository.insertFeeds(feeds);

      // THEN
      expect(result).toEqual([
        { ...feeds[0], id: 101 },
        { ...feeds[2], id: 103 },
      ]);
      expect(executeQueryStrictMock.mock.calls[1][1][0]).toHaveLength(3);
      expect(totalIncMock).toHaveBeenCalledWith(INSERT_LABEL, 3);
      expect(successIncMock).toHaveBeenCalledWith(INSERT_LABEL, 2);
      expect(duplicateIncMock).toHaveBeenCalledWith(1);
      expect(failureIncMock).not.toHaveBeenCalled();
    });

    it('다중 행 INSERT가 실패하면 행 단위 재시도로 폴백해서 나머지를 살려야 한다', async () => {
      // GIVEN: 다중 행 INSERT는 데드락 등으로 실패하지만, 개별 재시도는 둘 다 성공한다
      const feeds = [createFeed(1), createFeed(2)];
      const dbError = new Error('데드락 감지');
      executeQueryStrictMock
        .mockResolvedValueOnce([]) // 선조회
        .mockRejectedValueOnce(dbError) // 다중 행 INSERT 실패
        .mockResolvedValueOnce({ insertId: 201 }) // 개별 재시도: feeds[0]
        .mockResolvedValueOnce({ insertId: 202 }); // 개별 재시도: feeds[1]

      // WHEN
      const result = await feedRepository.insertFeeds(feeds);

      // THEN: 재조회 없이 개별 INSERT로 폴백해서 둘 다 결과에 포함되어야 한다
      expect(result).toEqual([
        { ...feeds[0], id: 201 },
        { ...feeds[1], id: 202 },
      ]);
      expect(executeQueryStrictMock).toHaveBeenCalledTimes(4);
      expect(executeQueryStrictMock).toHaveBeenNthCalledWith(
        3,
        expect.stringContaining('INSERT INTO feed'),
        toValueRow(feeds[0]),
      );
      expect(executeQueryStrictMock).toHaveBeenNthCalledWith(
        4,
        expect.stringContaining('INSERT INTO feed'),
        toValueRow(feeds[1]),
      );
      expect(totalIncMock).toHaveBeenCalledWith(INSERT_LABEL, 2);
      expect(successIncMock).toHaveBeenCalledWith(INSERT_LABEL, 2);
      expect(duplicateIncMock).not.toHaveBeenCalled();
      expect(failureIncMock).not.toHaveBeenCalled();
    });

    it('폴백한 개별 INSERT 중 일부가 실패하면 그 행만 제외하고 failure를 증가시켜야 한다', async () => {
      // GIVEN: feeds[1]의 개별 재시도가 FK 위반 등 진짜 에러로 실패한다
      const feeds = [createFeed(1), createFeed(2)];
      const bulkError = new Error('데드락 감지');
      const rowError = new Error('FK 위반');
      executeQueryStrictMock
        .mockResolvedValueOnce([])
        .mockRejectedValueOnce(bulkError)
        .mockResolvedValueOnce({ insertId: 201 })
        .mockRejectedValueOnce(rowError);

      // WHEN
      const result = await feedRepository.insertFeeds(feeds);

      // THEN
      expect(result).toEqual([{ ...feeds[0], id: 201 }]);
      expect(totalIncMock).toHaveBeenCalledWith(INSERT_LABEL, 2);
      expect(successIncMock).toHaveBeenCalledWith(INSERT_LABEL, 1);
      expect(duplicateIncMock).toHaveBeenCalledWith(1);
      expect(failureIncMock).toHaveBeenCalledWith(INSERT_LABEL);
    });

    it('폴백한 개별 INSERT가 ER_DUP_ENTRY로 실패하면 failure 없이 duplicate로만 집계해야 한다', async () => {
      // GIVEN: feeds[1]은 배치 내부 경합으로 이미 다른 곳에서 먼저 들어갔다
      const feeds = [createFeed(1), createFeed(2)];
      const bulkError = new Error('데드락 감지');
      const dupError = Object.assign(new Error('중복'), {
        code: 'ER_DUP_ENTRY',
      });
      executeQueryStrictMock
        .mockResolvedValueOnce([])
        .mockRejectedValueOnce(bulkError)
        .mockResolvedValueOnce({ insertId: 201 })
        .mockRejectedValueOnce(dupError);

      // WHEN
      const result = await feedRepository.insertFeeds(feeds);

      // THEN
      expect(result).toEqual([{ ...feeds[0], id: 201 }]);
      expect(duplicateIncMock).toHaveBeenCalledWith(1);
      expect(failureIncMock).not.toHaveBeenCalled();
    });

    it('선조회가 실패하면 INSERT 없이 failure를 증가시킨 뒤 에러를 전파한다', async () => {
      // GIVEN: 선조회도 INSERT와 동일하게 try/catch로 감싸여 failure 메트릭을 남긴다
      const feeds = [createFeed(1), createFeed(2)];
      const dbError = new Error('선조회 실패');
      executeQueryStrictMock.mockRejectedValueOnce(dbError);

      // WHEN & THEN
      await expect(feedRepository.insertFeeds(feeds)).rejects.toThrow(dbError);
      expect(executeQueryStrictMock).toHaveBeenCalledTimes(1);
      expect(totalIncMock).toHaveBeenCalledWith(INSERT_LABEL, 2);
      expect(failureIncMock).toHaveBeenCalledWith(INSERT_LABEL, 2);
      expect(successIncMock).not.toHaveBeenCalled();
      expect(duplicateIncMock).not.toHaveBeenCalled();
    });

    it('같은 사이클 내에 동일한 link가 중복으로 들어오면 하나만 삽입 후보로 남겨야 한다', async () => {
      // GIVEN: feeds[1]과 feeds[2]가 같은 link를 가진다 (동일 게시글 중복 파싱)
      const duplicateLink = createFeed(2).link;
      const feeds = [
        createFeed(1),
        { ...createFeed(2), link: duplicateLink },
        { ...createFeed(3), link: duplicateLink },
      ];
      executeQueryStrictMock
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce([
          { id: 101, path: feeds[0].link },
          { id: 102, path: feeds[1].link },
        ]);

      // WHEN
      const result = await feedRepository.insertFeeds(feeds);

      // THEN: 중복 link 중 먼저 나온 feeds[1]만 후보로 살아남고, feeds[2]는 duplicate로 집계된다
      const insertValues = executeQueryStrictMock.mock.calls[1][1][0];
      expect(insertValues).toHaveLength(2);
      expect(insertValues).toEqual([toValueRow(feeds[0]), toValueRow(feeds[1])]);
      expect(result).toEqual([
        { ...feeds[0], id: 101 },
        { ...feeds[1], id: 102 },
      ]);
      expect(totalIncMock).toHaveBeenCalledWith(INSERT_LABEL, 3);
      expect(successIncMock).toHaveBeenCalledWith(INSERT_LABEL, 2);
      expect(duplicateIncMock).toHaveBeenCalledWith(1);
    });

    it('빈 배열이 입력되면 선조회만 실행하고 빈 배열을 반환해야 한다', async () => {
      // GIVEN
      const feeds: FeedDetail[] = [];
      executeQueryStrictMock.mockResolvedValueOnce([]);

      // WHEN
      const result = await feedRepository.insertFeeds(feeds);

      // THEN
      expect(result).toEqual([]);
      expect(executeQueryStrictMock).toHaveBeenCalledTimes(1);
      expect(totalIncMock).toHaveBeenCalledWith(INSERT_LABEL, 0);
      expect(successIncMock).toHaveBeenCalledWith(INSERT_LABEL, 0);
      expect(duplicateIncMock).not.toHaveBeenCalled();
      expect(failureIncMock).not.toHaveBeenCalled();
    });
  });
});
