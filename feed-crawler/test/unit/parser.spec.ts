import { FeedParserManager } from '@common/parser/feed-parser-manager';
import { Atom10Parser } from '@common/parser/formats/atom10-parser';
import { Rss20Parser } from '@common/parser/formats/rss20-parser';
import { ParserUtil } from '@common/parser/utils/parser-util';

import {
  ATOM_10_SAMPLE,
  FIXED_DATE,
  INVALID_XML,
  MOCK_RSS_OBJ,
  RSS_20_SAMPLE,
} from '@test/config/constant/parser-fixtures';
import 'reflect-metadata';

describe('Parser 모듈 테스트', () => {
  let parserUtil: ParserUtil;
  let rss20Parser: Rss20Parser;
  let atom10Parser: Atom10Parser;
  let feedParserManager: FeedParserManager;

  beforeEach(() => {
    parserUtil = new ParserUtil();
    rss20Parser = new Rss20Parser(parserUtil);
    atom10Parser = new Atom10Parser(parserUtil);
    feedParserManager = new FeedParserManager(rss20Parser, atom10Parser);

    // URL 기반 조건부 fetch 모킹 (순서 의존성 제거)
    global.fetch = jest.fn().mockImplementation((url: string) => {
      // RSS/Atom 피드 URL
      if (url.includes('/rss') || url.includes('denamu.site')) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(RSS_20_SAMPLE),
        });
      }
      // HTML 페이지 (og:image 추출용)
      return Promise.resolve({
        ok: true,
        text: () =>
          Promise.resolve(
            '<html><head><meta property="og:image" content="https://example.com/image.jpg"></head></html>',
          ),
      });
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('FeedParserManager', () => {
    describe('findSuitableParser', () => {
      it('RSS 2.0 피드에 대해 올바른 파서를 반환해야 한다', () => {
        const parser = feedParserManager['findSuitableParser'](RSS_20_SAMPLE);
        expect(parser).toBeInstanceOf(Rss20Parser);
      });

      it('Atom 1.0 피드에 대해 올바른 파서를 반환해야 한다', () => {
        const parser = feedParserManager['findSuitableParser'](ATOM_10_SAMPLE);
        expect(parser).toBeInstanceOf(Atom10Parser);
      });

      it('지원하지 않는 형식에 대해 null을 반환해야 한다', () => {
        const parser = feedParserManager['findSuitableParser'](INVALID_XML);
        expect(parser).toBeNull();
      });
    });

    describe('fetchAndParse', () => {
      describe('RSS 2.0 피드', () => {
        beforeEach(() => {
          // URL 기반 조건부 모킹으로 순서 의존성 제거
          (global.fetch as jest.Mock).mockImplementation((url: string) => {
            if (url.includes('/rss') || url.includes('denamu.dev')) {
              return Promise.resolve({
                ok: true,
                text: () => Promise.resolve(RSS_20_SAMPLE),
              });
            }
            return Promise.resolve({
              ok: true,
              text: () =>
                Promise.resolve(
                  '<html><head><meta property="og:image" content="https://example.com/image.jpg"></head></html>',
                ),
            });
          });
        });

        it('정상적인 feedDetail을 반환해야 한다.', async () => {
          // 고정 날짜보다 이후 시간을 startTime으로 사용하여 피드가 포함되도록 함
          const startTime = new Date(FIXED_DATE.getTime() + 1000);
          const result = await feedParserManager.fetchAndParse(
            MOCK_RSS_OBJ,
            startTime,
          );

          expect(result[0]).toMatchObject({
            blogId: MOCK_RSS_OBJ.id,
            blogName: MOCK_RSS_OBJ.blogName,
            blogPlatform: MOCK_RSS_OBJ.blogPlatform,
            title: '첫 번째 글제목',
            link: expect.stringContaining('https://rssfeed.com/post1'),
            imageUrl: expect.any(String),
            content: expect.any(String),
            summary: expect.any(String),
            deathCount: 0,
          });
        });
      });

      describe('Atom 1.0 피드', () => {
        beforeEach(() => {
          // URL 기반 조건부 모킹으로 순서 의존성 제거
          (global.fetch as jest.Mock).mockImplementation((url: string) => {
            if (url.includes('/rss') || url.includes('denamu.dev')) {
              return Promise.resolve({
                ok: true,
                text: () => Promise.resolve(ATOM_10_SAMPLE),
              });
            }
            return Promise.resolve({
              ok: true,
              text: () =>
                Promise.resolve(
                  '<html><head><meta property="og:image" content="https://example.com/image.jpg"></head></html>',
                ),
            });
          });
        });

        it('정상적인 feedDetail을 반환해야 한다.', async () => {
          // 고정 날짜보다 이후 시간을 startTime으로 사용하여 피드가 포함되도록 함
          const startTime = new Date(FIXED_DATE.getTime() + 1000);
          const result = await feedParserManager.fetchAndParse(
            MOCK_RSS_OBJ,
            startTime,
          );

          expect(result[0]).toMatchObject({
            blogId: MOCK_RSS_OBJ.id,
            blogName: MOCK_RSS_OBJ.blogName,
            blogPlatform: MOCK_RSS_OBJ.blogPlatform,
            title: 'Atom 첫 번째 글',
            link: expect.stringContaining('https://atomfeed.com/entry1'),
            imageUrl: expect.any(String),
            content: expect.any(String),
            summary: expect.any(String),
            deathCount: 0,
          });
        });
      });
    });
  });

  describe('Rss20Parser', () => {
    describe('canParse', () => {
      it('RSS 2.0 형식을 올바르게 식별해야 한다', () => {
        const result = rss20Parser.canParse(RSS_20_SAMPLE);
        expect(result).toBe(true);
      });

      it('Atom 형식을 RSS로 잘못 식별하지 않아야 한다', () => {
        const result = rss20Parser.canParse(ATOM_10_SAMPLE);
        expect(result).toBe(false);
      });

      it('잘못된 XML 형식을 식별하지 않아야 한다', () => {
        const result = rss20Parser.canParse(INVALID_XML);
        expect(result).toBe(false);
      });
    });

    describe('extractRawFeeds', () => {
      it('RSS 2.0 피드를 올바르게 파싱해야 한다', () => {
        // 고정 날짜를 사용하므로 시간 모킹이 필요 없음
        const rawFeeds = rss20Parser['extractRawFeeds'](RSS_20_SAMPLE);

        expect(rawFeeds).toHaveLength(2);
        expect(rawFeeds[0]).toMatchObject({
          title: '첫 번째 글제목',
          link: 'https://rssfeed.com/post1',
          description: expect.any(String),
        });
        expect(rawFeeds[1]).toMatchObject({
          title: '· 특수문자 제목  ',
          link: 'https://rssfeed.com/post2',
        });
      });

      it('링크가 올바르게 추출되어야 한다', () => {
        const rawFeeds = rss20Parser['extractRawFeeds'](RSS_20_SAMPLE);
        // console.log(rawFeeds);

        expect(rawFeeds[0].link).toBe('https://rssfeed.com/post1');
        expect(rawFeeds[1].link).toBe('https://rssfeed.com/post2');
      });
    });
  });

  describe('Atom10Parser', () => {
    describe('canParse', () => {
      it('Atom 1.0 형식을 올바르게 식별해야 한다', () => {
        const result = atom10Parser.canParse(ATOM_10_SAMPLE);
        expect(result).toBe(true);
      });

      it('RSS 형식을 Atom으로 잘못 식별하지 않아야 한다', () => {
        const result = atom10Parser.canParse(RSS_20_SAMPLE);
        expect(result).toBe(false);
      });

      it('잘못된 XML 형식을 식별하지 않아야 한다', () => {
        const result = atom10Parser.canParse(INVALID_XML);
        expect(result).toBe(false);
      });
    });

    describe('extractRawFeeds', () => {
      it('Atom 1.0 피드를 올바르게 파싱해야 한다', () => {
        const rawFeeds = atom10Parser['extractRawFeeds'](ATOM_10_SAMPLE);
        expect(rawFeeds).toHaveLength(2);
        expect(rawFeeds[0]).toMatchObject({
          title: 'Atom 첫 번째 글',
          description: expect.any(String), // summary 또는 content 둘 중 하나가 사용됨
        });
        expect(rawFeeds[1]).toMatchObject({
          title: '· Atom 특수문자 제목  ',
        });
      });

      it('링크가 올바르게 추출되어야 한다', () => {
        const rawFeeds = atom10Parser['extractRawFeeds'](ATOM_10_SAMPLE);

        expect(rawFeeds[0].link).toBe('https://atomfeed.com/entry1');
        expect(rawFeeds[1].link).toBe('https://atomfeed.com/entry2');
      });
    });

    describe('extractLink', () => {
      it('문자열 형태의 링크를 처리해야 한다', () => {
        const result = atom10Parser['extractLink']('https://example.com');
        expect(result).toBe('https://example.com');
      });

      it('객체 형태의 링크를 처리해야 한다', () => {
        const linkData = { '@_href': 'https://example.com' };
        const result = atom10Parser['extractLink'](linkData);
        expect(result).toBe('https://example.com');
      });

      it('배열 형태의 링크에서 alternate를 우선 선택해야 한다', () => {
        const linkData = [
          { '@_rel': 'self', '@_href': 'https://example.com/self' },
          { '@_rel': 'alternate', '@_href': 'https://example.com/alternate' },
        ];
        const result = atom10Parser['extractLink'](linkData);
        expect(result).toBe('https://example.com/alternate');
      });
    });
  });
});
