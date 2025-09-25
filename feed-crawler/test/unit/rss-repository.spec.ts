import 'reflect-metadata';
import { RssRepository } from '../../src/repository/rss.repository';
import { DatabaseConnection } from '../../src/types/database-connection';
import { RssObj } from '../../src/common/types';

describe('RssRepository', () => {
  let rssRepository: RssRepository;
  let mockDatabaseConnection: jest.Mocked<DatabaseConnection>;

  const mockRssObjects: RssObj[] = [
    {
      id: 1,
      rssUrl: 'https://test1.tistory.com/rss',
      blogName: '테스트 블로그 1',
      blogPlatform: 'tistory',
    },
    {
      id: 2,
      rssUrl: 'https://velog.io/@test2/rss',
      blogName: '테스트 블로그 2',
      blogPlatform: 'velog',
    },
    {
      id: 3,
      rssUrl: 'https://medium.com/@test3/feed',
      blogName: '테스트 블로그 3',
      blogPlatform: 'medium',
    },
  ];

  beforeEach(() => {
    mockDatabaseConnection = {
      executeQuery: jest.fn(),
      executeQueryStrict: jest.fn(),
    } as any;

    rssRepository = new RssRepository(mockDatabaseConnection);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('selectAllRss', () => {
    it('모든 RSS 객체를 성공적으로 조회해야 한다', async () => {
      // Given
      mockDatabaseConnection.executeQuery.mockResolvedValue(mockRssObjects);

      // When
      const result = await rssRepository.selectAllRss();

      // Then
      expect(mockDatabaseConnection.executeQuery).toHaveBeenCalledWith(
        expect.stringContaining(
          'SELECT id, rss_url as rssUrl, name as blogName, blog_platform as blogPlatform',
        ),
        [],
      );
      expect(mockDatabaseConnection.executeQuery).toHaveBeenCalledWith(
        expect.stringContaining('FROM rss_accept'),
        [],
      );
      expect(result).toEqual(mockRssObjects);
    });

    it('RSS가 없을 때 빈 배열을 반환해야 한다', async () => {
      // Given
      mockDatabaseConnection.executeQuery.mockResolvedValue([]);

      // When
      const result = await rssRepository.selectAllRss();

      // Then
      expect(result).toEqual([]);
    });

    it('데이터베이스 에러가 발생할 때 에러를 던져야 한다', async () => {
      // Given
      const dbError = new Error('Database connection failed');
      mockDatabaseConnection.executeQuery.mockRejectedValue(dbError);

      // When & Then
      await expect(rssRepository.selectAllRss()).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('올바른 컬럼 매핑을 사용해야 한다', async () => {
      // Given
      const rawDbResult = [
        {
          id: 1,
          rssUrl: 'https://test.com/rss', // DB에서 rss_url as rssUrl로 매핑
          blogName: '테스트 블로그', // DB에서 name as blogName으로 매핑
          blogPlatform: 'tistory', // DB에서 blog_platform as blogPlatform으로 매핑
        },
      ];
      mockDatabaseConnection.executeQuery.mockResolvedValue(rawDbResult);

      // When
      const result = await rssRepository.selectAllRss();

      // Then
      expect(result[0]).toHaveProperty('rssUrl');
      expect(result[0]).toHaveProperty('blogName');
      expect(result[0]).toHaveProperty('blogPlatform');
      expect(result[0].rssUrl).toBe('https://test.com/rss');
      expect(result[0].blogName).toBe('테스트 블로그');
      expect(result[0].blogPlatform).toBe('tistory');
    });
  });

  describe('selectRssById', () => {
    it('특정 ID의 RSS 객체를 성공적으로 조회해야 한다', async () => {
      // Given
      const targetId = 1;
      const expectedRss = mockRssObjects[0];
      mockDatabaseConnection.executeQuery.mockResolvedValue([expectedRss]);

      // When
      const result = await rssRepository.selectRssById(targetId);

      // Then
      expect(mockDatabaseConnection.executeQuery).toHaveBeenCalledWith(
        expect.stringContaining(
          'SELECT id, rss_url as rssUrl, name as blogName, blog_platform as blogPlatform',
        ),
        [targetId],
      );
      expect(mockDatabaseConnection.executeQuery).toHaveBeenCalledWith(
        expect.stringContaining('FROM rss_accept WHERE id = ?'),
        [targetId],
      );
      expect(result).toEqual(expectedRss);
    });

    it('존재하지 않는 ID에 대해 null을 반환해야 한다', async () => {
      // Given
      const nonExistentId = 999;
      mockDatabaseConnection.executeQuery.mockResolvedValue([]);

      // When
      const result = await rssRepository.selectRssById(nonExistentId);

      // Then
      expect(result).toBeNull();
    });

    it('결과가 null일 때 null을 반환해야 한다', async () => {
      // Given
      const targetId = 1;
      mockDatabaseConnection.executeQuery.mockResolvedValue(null);

      // When
      const result = await rssRepository.selectRssById(targetId);

      // Then
      expect(result).toBeNull();
    });

    it('결과가 undefined일 때 null을 반환해야 한다', async () => {
      // Given
      const targetId = 1;
      mockDatabaseConnection.executeQuery.mockResolvedValue(undefined);

      // When
      const result = await rssRepository.selectRssById(targetId);

      // Then
      expect(result).toBeNull();
    });

    it('데이터베이스 에러가 발생할 때 에러를 던져야 한다', async () => {
      // Given
      const targetId = 1;
      const dbError = new Error('Database query failed');
      mockDatabaseConnection.executeQuery.mockRejectedValue(dbError);

      // When & Then
      await expect(rssRepository.selectRssById(targetId)).rejects.toThrow(
        'Database query failed',
      );
    });

    it('다양한 ID 타입을 처리해야 한다', async () => {
      // Given
      const testCases = [1, 100, 999999];

      for (const testId of testCases) {
        mockDatabaseConnection.executeQuery.mockResolvedValue([
          mockRssObjects[0],
        ]);

        // When
        await rssRepository.selectRssById(testId);

        // Then
        expect(mockDatabaseConnection.executeQuery).toHaveBeenCalledWith(
          expect.any(String),
          [testId],
        );
      }
    });

    it('여러 결과가 반환될 때 첫 번째 결과만 반환해야 한다', async () => {
      // Given
      const targetId = 1;
      const multipleResults = [mockRssObjects[0], mockRssObjects[1]]; // 잘못된 DB 상태 시뮬레이션
      mockDatabaseConnection.executeQuery.mockResolvedValue(multipleResults);

      // When
      const result = await rssRepository.selectRssById(targetId);

      // Then
      expect(result).toEqual(mockRssObjects[0]); // 첫 번째 결과만 반환
    });
  });

  describe('query structure validation', () => {
    it('selectAllRss 쿼리가 올바른 구조를 가져야 한다', async () => {
      // Given
      mockDatabaseConnection.executeQuery.mockResolvedValue([]);

      // When
      await rssRepository.selectAllRss();

      // Then
      const [query, params] = mockDatabaseConnection.executeQuery.mock.calls[0];
      expect(query).toContain('SELECT');
      expect(query).toContain('rss_url as rssUrl');
      expect(query).toContain('name as blogName');
      expect(query).toContain('blog_platform as blogPlatform');
      expect(query).toContain('FROM rss_accept');
      expect(params).toEqual([]);
    });

    it('selectRssById 쿼리가 올바른 구조를 가져야 한다', async () => {
      // Given
      const targetId = 123;
      mockDatabaseConnection.executeQuery.mockResolvedValue([]);

      // When
      await rssRepository.selectRssById(targetId);

      // Then
      const [query, params] = mockDatabaseConnection.executeQuery.mock.calls[0];
      expect(query).toContain('SELECT');
      expect(query).toContain('rss_url as rssUrl');
      expect(query).toContain('name as blogName');
      expect(query).toContain('blog_platform as blogPlatform');
      expect(query).toContain('FROM rss_accept');
      expect(query).toContain('WHERE id = ?');
      expect(params).toEqual([targetId]);
    });
  });
});
