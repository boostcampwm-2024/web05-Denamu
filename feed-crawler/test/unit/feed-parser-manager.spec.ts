import 'reflect-metadata';
import { FeedParserManager } from '../../src/common/parser/feed-parser-manager';
import { Rss20Parser } from '../../src/common/parser/formats/rss20-parser';
import { Atom10Parser } from '../../src/common/parser/formats/atom10-parser';
import { RssObj, FeedDetail } from '../../src/common/types';

// fetch 모킹
global.fetch = jest.fn();

describe('FeedParserManager', () => {
  let feedParserManager: FeedParserManager;
  let mockRss20Parser: jest.Mocked<Rss20Parser>;
  let mockAtom10Parser: jest.Mocked<Atom10Parser>;
  let mockFetch: jest.MockedFunction<typeof fetch>;

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
    mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

    mockRss20Parser = {
      canParse: jest.fn(),
      parseFeed: jest.fn(),
      parseAllFeeds: jest.fn(),
    } as any;

    mockAtom10Parser = {
      canParse: jest.fn(),
      parseFeed: jest.fn(),
      parseAllFeeds: jest.fn(),
    } as any;

    feedParserManager = new FeedParserManager(
      mockRss20Parser,
      mockAtom10Parser,
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
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(rssXmlData),
      } as any);
      mockRss20Parser.canParse.mockReturnValue(true);
      mockAtom10Parser.canParse.mockReturnValue(false);
      mockRss20Parser.parseFeed.mockResolvedValue(mockFeedDetails);

      // When
      const result = await feedParserManager.fetchAndParse(
        mockRssObj,
        startTime,
      );

      // Then
      expect(mockFetch).toHaveBeenCalledWith(mockRssObj.rssUrl, {
        headers: {
          Accept:
            'application/rss+xml, application/xml, text/xml, application/atom+xml',
        },
      });
      expect(mockRss20Parser.canParse).toHaveBeenCalledWith(rssXmlData);
      expect(mockRss20Parser.parseFeed).toHaveBeenCalledWith(
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
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(atomXmlData),
      } as any);
      mockRss20Parser.canParse.mockReturnValue(false);
      mockAtom10Parser.canParse.mockReturnValue(true);
      mockAtom10Parser.parseFeed.mockResolvedValue(mockFeedDetails);

      // When
      const result = await feedParserManager.fetchAndParse(
        mockRssObj,
        startTime,
      );

      // Then
      expect(mockAtom10Parser.canParse).toHaveBeenCalledWith(atomXmlData);
      expect(mockAtom10Parser.parseFeed).toHaveBeenCalledWith(
        mockRssObj,
        atomXmlData,
        startTime,
      );
      expect(result).toEqual(mockFeedDetails);
    });

    it('HTTP 요청이 실패할 때 빈 배열을 반환해야 한다', async () => {
      // Given
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as any);

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
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(invalidXmlData),
      } as any);
      mockRss20Parser.canParse.mockReturnValue(false);
      mockAtom10Parser.canParse.mockReturnValue(false);

      // When
      const result = await feedParserManager.fetchAndParse(
        mockRssObj,
        startTime,
      );

      // Then
      expect(result).toEqual([]);
    });

    it('네트워크 에러가 발생할 때 빈 배열을 반환해야 한다', async () => {
      // Given
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

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
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(rssXmlData),
      } as any);
      mockRss20Parser.canParse.mockReturnValue(true);
      mockRss20Parser.parseFeed.mockRejectedValueOnce(
        new Error('Parser error'),
      );

      // When
      const result = await feedParserManager.fetchAndParse(
        mockRssObj,
        startTime,
      );

      // Then
      expect(result).toEqual([]);
    });
  });

  describe('fetchAndParseAll', () => {
    it('전체 RSS 피드를 성공적으로 파싱해야 한다', async () => {
      // Given
      const rssXmlData = '<?xml version="1.0"?><rss version="2.0">...</rss>';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(rssXmlData),
      } as any);
      mockRss20Parser.canParse.mockReturnValue(true);
      mockAtom10Parser.canParse.mockReturnValue(false);
      mockRss20Parser.parseAllFeeds.mockResolvedValue(mockFeedDetails);

      // When
      const result = await feedParserManager.fetchAndParseAll(mockRssObj);

      // Then
      expect(mockFetch).toHaveBeenCalledWith(mockRssObj.rssUrl, {
        headers: {
          Accept:
            'application/rss+xml, application/xml, text/xml, application/atom+xml',
        },
      });
      expect(mockRss20Parser.canParse).toHaveBeenCalledWith(rssXmlData);
      expect(mockRss20Parser.parseAllFeeds).toHaveBeenCalledWith(
        mockRssObj,
        rssXmlData,
      );
      expect(result).toEqual(mockFeedDetails);
    });

    it('전체 Atom 피드를 성공적으로 파싱해야 한다', async () => {
      // Given
      const atomXmlData =
        '<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom">...</feed>';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(atomXmlData),
      } as any);
      mockRss20Parser.canParse.mockReturnValue(false);
      mockAtom10Parser.canParse.mockReturnValue(true);
      mockAtom10Parser.parseAllFeeds.mockResolvedValue(mockFeedDetails);

      // When
      const result = await feedParserManager.fetchAndParseAll(mockRssObj);

      // Then
      expect(mockAtom10Parser.canParse).toHaveBeenCalledWith(atomXmlData);
      expect(mockAtom10Parser.parseAllFeeds).toHaveBeenCalledWith(
        mockRssObj,
        atomXmlData,
      );
      expect(result).toEqual(mockFeedDetails);
    });

    it('HTTP 요청이 실패할 때 빈 배열을 반환해야 한다', async () => {
      // Given
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as any);

      // When
      const result = await feedParserManager.fetchAndParseAll(mockRssObj);

      // Then
      expect(result).toEqual([]);
    });

    it('지원하지 않는 피드 형식일 때 빈 배열을 반환해야 한다', async () => {
      // Given
      const invalidXmlData = '<?xml version="1.0"?><unknown>...</unknown>';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(invalidXmlData),
      } as any);
      mockRss20Parser.canParse.mockReturnValue(false);
      mockAtom10Parser.canParse.mockReturnValue(false);

      // When
      const result = await feedParserManager.fetchAndParseAll(mockRssObj);

      // Then
      expect(result).toEqual([]);
    });
  });

  describe('findSuitableParser', () => {
    it('RSS 2.0에 대해 올바른 파서를 반환해야 한다', () => {
      // Given
      const rssXmlData = '<?xml version="1.0"?><rss version="2.0">...</rss>';
      mockRss20Parser.canParse.mockReturnValue(true);
      mockAtom10Parser.canParse.mockReturnValue(false);

      // When
      const result = feedParserManager['findSuitableParser'](rssXmlData);

      // Then
      expect(result).toBe(mockRss20Parser);
    });

    it('Atom 1.0에 대해 올바른 파서를 반환해야 한다', () => {
      // Given
      const atomXmlData =
        '<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom">...</feed>';
      mockRss20Parser.canParse.mockReturnValue(false);
      mockAtom10Parser.canParse.mockReturnValue(true);

      // When
      const result = feedParserManager['findSuitableParser'](atomXmlData);

      // Then
      expect(result).toBe(mockAtom10Parser);
    });

    it('지원하지 않는 형식에 대해 null을 반환해야 한다', () => {
      // Given
      const invalidXmlData = '<?xml version="1.0"?><invalid>...</invalid>';
      mockRss20Parser.canParse.mockReturnValue(false);
      mockAtom10Parser.canParse.mockReturnValue(false);

      // When
      const result = feedParserManager['findSuitableParser'](invalidXmlData);

      // Then
      expect(result).toBeNull();
    });

    it('첫 번째 매칭되는 파서를 반환해야 한다', () => {
      // Given
      const xmlData = '<?xml version="1.0"?>...';
      mockRss20Parser.canParse.mockReturnValue(true);
      mockAtom10Parser.canParse.mockReturnValue(true); // 둘 다 true여도 첫 번째 반환

      // When
      const result = feedParserManager['findSuitableParser'](xmlData);

      // Then
      expect(result).toBe(mockRss20Parser);
      expect(mockRss20Parser.canParse).toHaveBeenCalledWith(xmlData);
      // 첫 번째 파서가 매칭되면 두 번째는 호출되지 않아야 함
      expect(mockAtom10Parser.canParse).not.toHaveBeenCalled();
    });
  });

  describe('error handling and resilience', () => {
    const startTime = new Date('2024-01-01T12:00:00Z');

    it('fetch timeout 에러를 처리해야 한다', async () => {
      // Given
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'AbortError';
      mockFetch.mockRejectedValueOnce(timeoutError);

      // When
      const result = await feedParserManager.fetchAndParse(
        mockRssObj,
        startTime,
      );

      // Then
      expect(result).toEqual([]);
    });

    it('잘못된 XML 응답을 처리해야 한다', async () => {
      // Given
      const invalidXml = 'This is not XML content';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(invalidXml),
      } as any);
      mockRss20Parser.canParse.mockReturnValue(false);
      mockAtom10Parser.canParse.mockReturnValue(false);

      // When
      const result = await feedParserManager.fetchAndParse(
        mockRssObj,
        startTime,
      );

      // Then
      expect(result).toEqual([]);
    });

    it('빈 응답을 처리해야 한다', async () => {
      // Given
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(''),
      } as any);
      mockRss20Parser.canParse.mockReturnValue(false);
      mockAtom10Parser.canParse.mockReturnValue(false);

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
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(largeXmlData),
      } as any);
      mockRss20Parser.canParse.mockReturnValue(true);
      mockRss20Parser.parseFeed.mockResolvedValue(mockFeedDetails);

      // When
      const result = await feedParserManager.fetchAndParse(
        mockRssObj,
        startTime,
      );

      // Then
      expect(result).toEqual(mockFeedDetails);
      expect(mockRss20Parser.parseFeed).toHaveBeenCalledWith(
        mockRssObj,
        largeXmlData,
        startTime,
      );
    });
  });

  describe('HTTP headers and content negotiation', () => {
    it('적절한 Accept 헤더를 설정해야 한다', async () => {
      // Given
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<?xml version="1.0"?><rss>...</rss>'),
      } as any);
      mockRss20Parser.canParse.mockReturnValue(false);
      mockAtom10Parser.canParse.mockReturnValue(false);

      // When
      await feedParserManager.fetchAndParse(mockRssObj, new Date());

      // Then
      expect(mockFetch).toHaveBeenCalledWith(mockRssObj.rssUrl, {
        headers: {
          Accept:
            'application/rss+xml, application/xml, text/xml, application/atom+xml',
        },
      });
    });

    it('fetchAndParseAll에서도 동일한 헤더를 사용해야 한다', async () => {
      // Given
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<?xml version="1.0"?><feed>...</feed>'),
      } as any);
      mockRss20Parser.canParse.mockReturnValue(false);
      mockAtom10Parser.canParse.mockReturnValue(false);

      // When
      await feedParserManager.fetchAndParseAll(mockRssObj);

      // Then
      expect(mockFetch).toHaveBeenCalledWith(mockRssObj.rssUrl, {
        headers: {
          Accept:
            'application/rss+xml, application/xml, text/xml, application/atom+xml',
        },
      });
    });
  });
});


