import 'reflect-metadata';

import { FeedParserManager } from '@common/parser/feed-parser-manager';
import { FeedDetail, RssObj } from '@common/types';

import { FeedRepository } from '@repository/feed.repository';
import { RssRepository } from '@repository/rss.repository';

import { FeedCrawler } from '../../src/feed-crawler';

describe('FeedCrawler', () => {
  let feedCrawler: FeedCrawler;
  let mockFeedRepository: jest.Mocked<FeedRepository>;
  let mockRssRepository: jest.Mocked<RssRepository>;
  let mockFeedParserManager: jest.Mocked<FeedParserManager>;
  let deleteRecentFeedMock: jest.Mock;
  let insertFeedsMock: jest.Mock;
  let saveAiQueueMock: jest.Mock;
  let setRecentFeedListMock: jest.Mock;
  let selectAllRssMock: jest.Mock;
  let fetchAndParseMock: jest.Mock;
  let fetchAndParseAllMock: jest.Mock;

  const mockRssObjects: RssObj[] = [
    {
      id: 1,
      blogName: '테스트 블로그 1',
      blogPlatform: 'tistory',
      rssUrl: 'https://test1.tistory.com/rss',
    },
    {
      id: 2,
      blogName: '테스트 블로그 2',
      blogPlatform: 'velog',
      rssUrl: 'https://velog.io/@test2/rss',
    },
  ];

  const mockFeedDetails: FeedDetail[] = [
    {
      id: 1,
      blogId: 1,
      blogName: '테스트 블로그 1',
      blogPlatform: 'tistory',
      pubDate: '2024-01-01 12:00:00',
      title: '테스트 피드 1',
      link: 'https://test1.tistory.com/1',
      imageUrl: 'https://test1.tistory.com/image1.jpg',
      content: '테스트 내용 1',
      summary: 'AI 요약 처리 중...',
      deathCount: 0,
    },
    {
      id: 2,
      blogId: 2,
      blogName: '테스트 블로그 2',
      blogPlatform: 'velog',
      pubDate: '2024-01-01 12:30:00',
      title: '테스트 피드 2',
      link: 'https://velog.io/@test2/2',
      imageUrl: 'https://velog.io/image2.jpg',
      content: '테스트 내용 2',
      summary: 'AI 요약 처리 중...',
      deathCount: 0,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    deleteRecentFeedMock = jest.fn();
    insertFeedsMock = jest.fn();
    saveAiQueueMock = jest.fn();
    setRecentFeedListMock = jest.fn();
    selectAllRssMock = jest.fn();
    fetchAndParseMock = jest.fn();
    fetchAndParseAllMock = jest.fn();

    mockFeedRepository = {
      deleteRecentFeed: deleteRecentFeedMock,
      insertFeeds: insertFeedsMock,
      saveAiQueue: saveAiQueueMock,
      setRecentFeedList: setRecentFeedListMock,
      updateSummary: jest.fn(),
      updateNullSummary: jest.fn(),
    } as any;

    mockRssRepository = {
      selectAllRss: selectAllRssMock,
      selectRssById: jest.fn(),
    } as any;

    mockFeedParserManager = {
      fetchAndParse: fetchAndParseMock,
      fetchAndParseAll: fetchAndParseAllMock,
    } as any;

    feedCrawler = new FeedCrawler(
      mockRssRepository,
      mockFeedRepository,
      mockFeedParserManager,
    );
  });

  describe('start', () => {
    it('정상적인 크롤링 플로우를 실행해야 한다', async () => {
      // Given
      const startTime = new Date('2024-01-01T12:00:00Z');
      selectAllRssMock.mockResolvedValue(mockRssObjects);
      fetchAndParseMock
        .mockResolvedValueOnce([mockFeedDetails[0]])
        .mockResolvedValueOnce([mockFeedDetails[1]]);
      insertFeedsMock.mockResolvedValue(mockFeedDetails);

      // When
      await feedCrawler.start(startTime);

      // Then
      expect(deleteRecentFeedMock).toHaveBeenCalledTimes(1);
      expect(selectAllRssMock).toHaveBeenCalledTimes(1);
      expect(fetchAndParseMock).toHaveBeenCalledTimes(2);
      expect(fetchAndParseMock).toHaveBeenNthCalledWith(
        1,
        mockRssObjects[0],
        startTime,
      );
      expect(fetchAndParseMock).toHaveBeenNthCalledWith(
        2,
        mockRssObjects[1],
        startTime,
      );
      expect(insertFeedsMock).toHaveBeenCalledWith(mockFeedDetails);
      expect(saveAiQueueMock).toHaveBeenCalledWith(mockFeedDetails);
      expect(setRecentFeedListMock).toHaveBeenCalledWith(mockFeedDetails);
    });

    it('등록된 RSS가 없을 때 조기 종료해야 한다', async () => {
      // Given
      const startTime = new Date('2024-01-01T12:00:00Z');
      selectAllRssMock.mockResolvedValue([]);

      // When
      await feedCrawler.start(startTime);

      // Then
      expect(deleteRecentFeedMock).toHaveBeenCalledTimes(1);
      expect(selectAllRssMock).toHaveBeenCalledTimes(1);
      expect(fetchAndParseMock).not.toHaveBeenCalled();
      expect(insertFeedsMock).not.toHaveBeenCalled();
    });

    it('새로운 피드가 없을 때 조기 종료해야 한다', async () => {
      // Given
      const startTime = new Date('2024-01-01T12:00:00Z');
      selectAllRssMock.mockResolvedValue(mockRssObjects);
      fetchAndParseMock.mockResolvedValue([]);

      // When
      await feedCrawler.start(startTime);

      // Then
      expect(deleteRecentFeedMock).toHaveBeenCalledTimes(1);
      expect(selectAllRssMock).toHaveBeenCalledTimes(1);
      expect(fetchAndParseMock).toHaveBeenCalledTimes(2);
      expect(insertFeedsMock).not.toHaveBeenCalled();
    });

    it('RSS 객체가 null일 때 조기 종료해야 한다', async () => {
      // Given
      const startTime = new Date('2024-01-01T12:00:00Z');
      selectAllRssMock.mockResolvedValue(null);

      // When
      await feedCrawler.start(startTime);

      // Then
      expect(deleteRecentFeedMock).toHaveBeenCalledTimes(1);
      expect(selectAllRssMock).toHaveBeenCalledTimes(1);
      expect(fetchAndParseMock).not.toHaveBeenCalled();
    });
  });

  describe('startFullCrawl', () => {
    it('전체 크롤링을 정상적으로 실행해야 한다', async () => {
      // Given
      const rssObj = mockRssObjects[0];
      const expectedFeeds = [mockFeedDetails[0]];
      fetchAndParseAllMock.mockResolvedValue(expectedFeeds);
      insertFeedsMock.mockResolvedValue(expectedFeeds);

      // When
      const result = await feedCrawler.startFullCrawl(rssObj);

      // Then
      expect(fetchAndParseAllMock).toHaveBeenCalledWith(rssObj);
      expect(insertFeedsMock).toHaveBeenCalledWith(expectedFeeds);
      expect(saveAiQueueMock).toHaveBeenCalledWith(expectedFeeds);
      expect(result).toEqual(expectedFeeds);
    });

    it('가져올 피드가 없을 때 빈 배열을 반환해야 한다', async () => {
      // Given
      const rssObj = mockRssObjects[0];
      fetchAndParseAllMock.mockResolvedValue([]);

      // When
      const result = await feedCrawler.startFullCrawl(rssObj);

      // Then
      expect(fetchAndParseAllMock).toHaveBeenCalledWith(rssObj);
      expect(insertFeedsMock).not.toHaveBeenCalled();
      expect(saveAiQueueMock).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('feedGroupByRss', () => {
    it('모든 RSS 객체에 대해 병렬 처리해야 한다', async () => {
      // Given
      const startTime = new Date('2024-01-01T12:00:00Z');
      const callOrder: number[] = [];

      // 병렬 실행 검증: 첫 번째 호출에 지연을 주어 병렬 실행 시 순서가 뒤바뀌는지 확인
      fetchAndParseMock
        .mockImplementationOnce(async () => {
          await new Promise((resolve) => setTimeout(resolve, 50));
          callOrder.push(1);
          return [mockFeedDetails[0]];
        })
        .mockImplementationOnce(() => {
          callOrder.push(2);
          return Promise.resolve([mockFeedDetails[1]]);
        });

      // When
      const result = await feedCrawler['feedGroupByRss'](
        mockRssObjects,
        startTime,
      );

      // Then
      expect(fetchAndParseMock).toHaveBeenCalledTimes(2);
      expect(result).toEqual([[mockFeedDetails[0]], [mockFeedDetails[1]]]);
      // 병렬 실행이면 지연이 없는 두 번째가 먼저 완료됨
      expect(callOrder).toEqual([2, 1]);
    });

    it('빈 RSS 배열에 대해 빈 결과를 반환해야 한다', async () => {
      // Given
      const startTime = new Date('2024-01-01T12:00:00Z');

      // When
      const result = await feedCrawler['feedGroupByRss']([], startTime);

      // Then
      expect(fetchAndParseMock).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
});
