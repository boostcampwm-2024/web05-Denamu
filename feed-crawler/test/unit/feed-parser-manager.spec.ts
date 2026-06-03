import 'reflect-metadata';

import axios, { HttpStatusCode } from 'axios';

import { FeedMetrics } from '@common/metrics/feed-metrics';
import { Notifier } from '@common/notification/notifier.interface';
import { FeedParserManager } from '@common/parser/feed-parser-manager';
import { Atom10Parser } from '@common/parser/formats/atom10-parser';
import { Rss20Parser } from '@common/parser/formats/rss20-parser';
import { FeedDetail, RssObj } from '@common/types';

describe('FeedParserManager', () => {
  let feedParserManager: FeedParserManager;
  let mockRss20Parser: jest.Mocked<Rss20Parser>;
  let mockAtom10Parser: jest.Mocked<Atom10Parser>;
  let mockAxiosGet: jest.SpyInstance;
  let mockNotifier: jest.Mocked<Notifier>;
  let mockFeedMetrics: jest.Mocked<FeedMetrics>;
  let rss20CanParseMock: jest.Mock;
  let rss20ParseFeedMock: jest.Mock;
  let atom10CanParseMock: jest.Mock;
  let atom10ParseFeedMock: jest.Mock;

  const mockRssObj: RssObj = {
    id: 1,
    blogName: '테스트 블로그',
    blogPlatform: 'tistory',
    rssUrl: 'https://test.tistory.com/rss',
  };

  const mockFeedDetails: FeedDetail[] = [
    {
      id: null,
      blogId: 1,
      blogName: '테스트 블로그',
      blogPlatform: 'tistory',
      pubDate: '2024-01-01 12:00:00',
      title: '테스트 피드 1',
      link: 'https://test.tistory.com/1',
      imageUrl: 'https://test.tistory.com/image1.jpg',
      content: '테스트 내용 1',
      summary: 'AI 요약 처리 중...',
      deathCount: 0,
    },
  ];

  beforeEach(() => {
    mockAxiosGet = jest.spyOn(axios, 'get');

    rss20CanParseMock = jest.fn();
    rss20ParseFeedMock = jest.fn();
    atom10CanParseMock = jest.fn();
    atom10ParseFeedMock = jest.fn();

    mockRss20Parser = {
      canParse: rss20CanParseMock,
      parseFeed: rss20ParseFeedMock,
      parseAllFeeds: jest.fn(),
    } as any;

    mockAtom10Parser = {
      canParse: atom10CanParseMock,
      parseFeed: atom10ParseFeedMock,
      parseAllFeeds: jest.fn(),
    } as any;

    mockNotifier = {
      initialize: jest.fn(),
      publish: jest.fn(),
    };

    mockFeedMetrics = {
      total: { inc: jest.fn() },
      success: { inc: jest.fn() },
      failure: { inc: jest.fn() },
      fullCrawlQueueDepth: { set: jest.fn() },
      fullCrawlPermanentFailure: { inc: jest.fn() },
      startMetricsServer: jest.fn(),
    } as any;

    feedParserManager = new FeedParserManager(
      mockRss20Parser,
      mockAtom10Parser,
      mockNotifier,
      mockFeedMetrics,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchAndParse', () => {
    const startTime = new Date('2024-01-01T12:00:00Z');

    it('RSS 2.0 피드를 성공적으로 파싱해야 한다', async () => {
      // Given
      const rssXmlData = '<?xml version="1.0"?><rss version="2.0">...</rss>';
      mockAxiosGet.mockResolvedValueOnce({
        data: rssXmlData,
        status: HttpStatusCode.Ok,
      });
      rss20CanParseMock.mockReturnValue(true);
      atom10CanParseMock.mockReturnValue(false);
      rss20ParseFeedMock.mockResolvedValue(mockFeedDetails);

      // When
      const result = await feedParserManager.fetchAndParse(
        mockRssObj,
        startTime,
      );

      // Then
      expect(mockAxiosGet).toHaveBeenCalledWith(mockRssObj.rssUrl, {
        headers: {
          Accept:
            'application/rss+xml, application/xml, text/xml, application/atom+xml',
        },
        responseType: 'text',
      });
      expect(rss20CanParseMock).toHaveBeenCalledWith(rssXmlData);
      expect(rss20ParseFeedMock).toHaveBeenCalledWith(
        mockRssObj,
        rssXmlData,
        startTime,
      );
      expect(result).toEqual(mockFeedDetails);
    });

    it('Atom 1.0 피드를 성공적으로 파싱해야 한다', async () => {
      // Given
      const atomXmlData =
        '<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom">...</feed>';
      mockAxiosGet.mockResolvedValueOnce({
        data: atomXmlData,
        status: HttpStatusCode.Ok,
      });
      rss20CanParseMock.mockReturnValue(false);
      atom10CanParseMock.mockReturnValue(true);
      atom10ParseFeedMock.mockResolvedValue(mockFeedDetails);

      // When
      const result = await feedParserManager.fetchAndParse(
        mockRssObj,
        startTime,
      );

      // Then
      expect(atom10CanParseMock).toHaveBeenCalledWith(atomXmlData);
      expect(atom10ParseFeedMock).toHaveBeenCalledWith(
        mockRssObj,
        atomXmlData,
        startTime,
      );
      expect(result).toEqual(mockFeedDetails);
    });

    it('HTTP 요청이 실패할 때 빈 배열을 반환해야 한다', async () => {
      // Given
      mockAxiosGet.mockRejectedValueOnce(
        new Error('Request failed with status code 404'),
      );

      // When
      const result = await feedParserManager.fetchAndParse(
        mockRssObj,
        startTime,
      );

      // Then
      expect(result).toEqual([]);
    });

    it('지원하지 않는 피드 형식일 때 빈 배열을 반환해야 한다', async () => {
      // Given
      const invalidXmlData = '<?xml version="1.0"?><invalid>...</invalid>';
      mockAxiosGet.mockResolvedValueOnce({
        data: invalidXmlData,
        status: HttpStatusCode.Ok,
      });
      rss20CanParseMock.mockReturnValue(false);
      atom10CanParseMock.mockReturnValue(false);

      // When
      const result = await feedParserManager.fetchAndParse(
        mockRssObj,
        startTime,
      );

      // Then
      expect(result).toEqual([]);
    });

    it('파서에서 에러가 발생할 때 빈 배열을 반환해야 한다', async () => {
      // Given
      const rssXmlData = '<?xml version="1.0"?><rss version="2.0">...</rss>';
      mockAxiosGet.mockResolvedValueOnce({
        data: rssXmlData,
        status: HttpStatusCode.Ok,
      });
      rss20CanParseMock.mockReturnValue(true);
      rss20ParseFeedMock.mockRejectedValueOnce(new Error('Parser error'));

      // When
      const result = await feedParserManager.fetchAndParse(
        mockRssObj,
        startTime,
      );

      // Then
      expect(result).toEqual([]);
    });
  });

  describe('error handling and resilience', () => {
    const startTime = new Date('2024-01-01T12:00:00Z');
    it('빈 응답을 처리해야 한다', async () => {
      // Given
      mockAxiosGet.mockResolvedValueOnce({
        data: '',
        status: HttpStatusCode.Ok,
      });
      rss20CanParseMock.mockReturnValue(false);
      atom10CanParseMock.mockReturnValue(false);

      // When
      const result = await feedParserManager.fetchAndParse(
        mockRssObj,
        startTime,
      );

      // Then
      expect(result).toEqual([]);
    });

    it('매우 큰 응답을 처리해야 한다', async () => {
      // Given
      const largeXmlData =
        '<?xml version="1.0"?><rss version="2.0">' +
        'x'.repeat(10000) +
        '</rss>';
      mockAxiosGet.mockResolvedValueOnce({
        data: largeXmlData,
        status: HttpStatusCode.Ok,
      });
      rss20CanParseMock.mockReturnValue(true);
      rss20ParseFeedMock.mockResolvedValue(mockFeedDetails);

      // When
      const result = await feedParserManager.fetchAndParse(
        mockRssObj,
        startTime,
      );

      // Then
      expect(result).toEqual(mockFeedDetails);
      expect(rss20ParseFeedMock).toHaveBeenCalledWith(
        mockRssObj,
        largeXmlData,
        startTime,
      );
    });
  });
});
