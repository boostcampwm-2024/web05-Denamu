import 'reflect-metadata';

import { ParserUtil } from '@common/parser/utils/parser-util';

// fetch 모킹
global.fetch = jest.fn();

describe('ParserUtil', () => {
  let parserUtil: ParserUtil;
  let mockFetch: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    parserUtil = new ParserUtil();
    mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getThumbnailUrl', () => {
    const feedUrl = 'https://example.com/feed/1';

    it('절대 경로 썸네일 URL을 올바르게 추출해야 한다', async () => {
      // Given
      const absoluteThumbnailUrl = 'https://example.com/images/thumbnail.jpg';
      const htmlContent = `
        <html>
          <head>
            <meta property="og:image" content="${absoluteThumbnailUrl}">
          </head>
        </html>
      `;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(htmlContent),
      } as any);

      // When
      const result = await parserUtil.getThumbnailUrl(feedUrl);

      // Then
      expect(mockFetch).toHaveBeenCalledWith(feedUrl, {
        headers: { Accept: 'text/html' },
      });
      expect(result).toBe(absoluteThumbnailUrl);
    });

    it('상대 경로 썸네일 URL을 절대 경로로 변환해야 한다', async () => {
      // Given
      const relativeThumbnailUrl = '/images/thumbnail.jpg';
      const expectedAbsoluteUrl = 'https://example.com/images/thumbnail.jpg';
      const htmlContent = `
        <html>
          <head>
            <meta property="og:image" content="${relativeThumbnailUrl}">
          </head>
        </html>
      `;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(htmlContent),
      } as any);

      // When
      const result = await parserUtil.getThumbnailUrl(feedUrl);

      // Then
      expect(result).toBe(expectedAbsoluteUrl);
    });

    it('og:image 메타 태그가 없을 때 빈 문자열을 반환해야 한다', async () => {
      // Given
      const htmlContent = `
        <html>
          <head>
            <title>테스트 페이지</title>
          </head>
        </html>
      `;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(htmlContent),
      } as any);

      // When
      const result = await parserUtil.getThumbnailUrl(feedUrl);

      // Then
      expect(result).toBe('');
    });

    it('og:image content가 빈 값일 때 빈 문자열을 반환해야 한다', async () => {
      // Given
      const htmlContent = `
        <html>
          <head>
            <meta property="og:image" content="">
          </head>
        </html>
      `;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(htmlContent),
      } as any);

      // When
      const result = await parserUtil.getThumbnailUrl(feedUrl);

      // Then
      expect(result).toBe('');
    });

    it('HTTP 요청이 실패할 때 에러를 던져야 한다', async () => {
      // Given
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as any);

      // When & Then
      await expect(parserUtil.getThumbnailUrl(feedUrl)).rejects.toThrow(
        `${feedUrl}에 GET 요청 실패`,
      );
    });

    it('fetch 자체가 실패할 때 에러를 던져야 한다', async () => {
      // Given
      const networkError = new Error('Network error');
      mockFetch.mockRejectedValueOnce(networkError);

      // When & Then
      await expect(parserUtil.getThumbnailUrl(feedUrl)).rejects.toThrow(
        'Network error',
      );
    });

    it('복잡한 HTML 구조에서도 썸네일을 추출해야 한다', async () => {
      // Given
      const thumbnailUrl = 'https://example.com/complex-thumbnail.jpg';
      const complexHtmlContent = `
        <!DOCTYPE html>
        <html lang="ko">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>복잡한 페이지</title>
            <meta name="description" content="테스트 설명">
            <meta property="og:title" content="테스트 제목">
            <meta property="og:description" content="테스트 설명">
            <meta property="og:image" content="${thumbnailUrl}">
            <meta property="og:url" content="https://example.com">
          </head>
          <body>
            <div>콘텐츠</div>
          </body>
        </html>
      `;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(complexHtmlContent),
      } as any);

      // When
      const result = await parserUtil.getThumbnailUrl(feedUrl);

      // Then
      expect(result).toBe(thumbnailUrl);
    });

    it('서브도메인이 있는 URL에서 상대 경로를 올바르게 처리해야 한다', async () => {
      // Given
      const subdomainUrl = 'https://blog.example.com/post/123';
      const relativeThumbnailUrl = '/assets/image.png';
      const expectedAbsoluteUrl = 'https://blog.example.com/assets/image.png';
      const htmlContent = `
        <html>
          <head>
            <meta property="og:image" content="${relativeThumbnailUrl}">
          </head>
        </html>
      `;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(htmlContent),
      } as any);

      // When
      const result = await parserUtil.getThumbnailUrl(subdomainUrl);

      // Then
      expect(result).toBe(expectedAbsoluteUrl);
    });
  });

  describe('isUrlPath (private method)', () => {
    it('HTTP URL을 올바르게 식별해야 한다', () => {
      // When & Then
      expect(parserUtil['isUrlPath']('http://example.com')).toBe(true);
      expect(parserUtil['isUrlPath']('https://example.com')).toBe(true);
    });

    it('상대 경로를 올바르게 식별해야 한다', () => {
      // When & Then
      expect(parserUtil['isUrlPath']('/path/to/image')).toBe(false);
      expect(parserUtil['isUrlPath']('./relative/path')).toBe(false);
      expect(parserUtil['isUrlPath']('relative/path')).toBe(false);
    });

    it('프로토콜이 없는 URL을 상대 경로로 처리해야 한다', () => {
      // When & Then
      expect(parserUtil['isUrlPath']('//example.com/image.jpg')).toBe(false);
      expect(parserUtil['isUrlPath']('example.com/image.jpg')).toBe(false);
    });
  });

  describe('getHttpOriginPath (private method)', () => {
    it('URL에서 origin을 올바르게 추출해야 한다', () => {
      // When & Then
      expect(
        parserUtil['getHttpOriginPath']('https://example.com/path/to/page'),
      ).toBe('https://example.com');
      expect(
        parserUtil['getHttpOriginPath'](
          'http://blog.example.com:8080/post/123',
        ),
      ).toBe('http://blog.example.com:8080');
    });

    it('쿼리 파라미터가 있는 URL에서 origin을 추출해야 한다', () => {
      // When & Then
      expect(
        parserUtil['getHttpOriginPath'](
          'https://example.com/search?q=test&page=1',
        ),
      ).toBe('https://example.com');
    });

    it('해시가 있는 URL에서 origin을 추출해야 한다', () => {
      // When & Then
      expect(
        parserUtil['getHttpOriginPath']('https://example.com/page#section'),
      ).toBe('https://example.com');
    });
  });

  describe('customUnescape', () => {
    it('특수 문자 엔티티를 올바르게 변환해야 한다', () => {
      // Given
      const testCases = [
        { input: '&middot; 제목', expected: '· 제목' },
        { input: '제목&nbsp;테스트', expected: '제목 테스트' },
        {
          input: '&middot;&nbsp;복합&nbsp;테스트&middot;',
          expected: '· 복합 테스트·',
        },
      ];

      testCases.forEach(({ input, expected }) => {
        // When
        const result = parserUtil.customUnescape(input);

        // Then
        expect(result).toBe(expected);
      });
    });

    it('HTML 엔티티를 올바르게 변환해야 한다', () => {
      // Given
      const testCases = [
        { input: '&lt;script&gt;', expected: '<script>' },
        { input: '&amp;nbsp;', expected: '&nbsp;' },
        { input: '&quot;테스트&quot;', expected: '"테스트"' },
        { input: '&#39;테스트&#39;', expected: "'테스트'" },
      ];

      testCases.forEach(({ input, expected }) => {
        // When
        const result = parserUtil.customUnescape(input);

        // Then
        expect(result).toBe(expected);
      });
    });

    it('복합 엔티티를 순서대로 처리해야 한다', () => {
      // Given
      const input = '&middot;&nbsp;&amp;&lt;&gt;&quot;&#39;';
      const expected = '· &<>"\'';

      // When
      const result = parserUtil.customUnescape(input);

      // Then
      expect(result).toBe(expected);
    });

    it('엔티티가 없는 문자열을 그대로 반환해야 한다', () => {
      // Given
      const input = '일반 텍스트 제목';

      // When
      const result = parserUtil.customUnescape(input);

      // Then
      expect(result).toBe(input);
    });

    it('빈 문자열을 올바르게 처리해야 한다', () => {
      // Given
      const input = '';

      // When
      const result = parserUtil.customUnescape(input);

      // Then
      expect(result).toBe('');
    });

    it('중복된 엔티티를 모두 변환해야 한다', () => {
      // Given
      const input = '&middot;&middot;&middot; 여러개 &nbsp;&nbsp; 공백';
      const expected = '··· 여러개    공백';

      // When
      const result = parserUtil.customUnescape(input);

      // Then
      expect(result).toBe(expected);
    });
  });
});
