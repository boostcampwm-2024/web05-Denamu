import 'reflect-metadata';
import { ParserUtil } from '../src/common/parser/utils/parser-util';
import { Rss20Parser } from '../src/common/parser/formats/rss20-parser';
import { Atom10Parser } from '../src/common/parser/formats/atom10-parser';
import { FeedParserManager } from '../src/common/parser/feed-parser-manager';
import { RssObj } from '../src/common/types';

// RSS 2.0 예제 데이터
const RSS_20_SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>테스트 블로그</title>
    <description>테스트용 블로그입니다</description>
    <link>https://testblog.com</link>
    <item>
      <title>첫 번째 글제목</title>
      <description>첫 번째 글 내용입니다.</description>
      <content:encoded><![CDATA[<p>첫 번째 글 내용입니다.</p>]]></content:encoded>
      <link>https://testblog.com/post1</link>
      <pubDate>${new Date().toUTCString()}</pubDate>
    </item>
    <item>
      <title>&middot; 특수문자 제목 &nbsp;</title>
      <description>두 번째 글 내용입니다.</description>
      <link>https://testblog.com/post2</link>
      <pubDate>${new Date().toUTCString()}</pubDate>
    </item>
  </channel>
</rss>`;

// Atom 1.0 예제 데이터
const ATOM_10_SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>테스트 Atom 피드</title>
  <link href="https://atomfeed.com"/>
  <id>https://atomfeed.com</id>
  <updated>${new Date().toISOString()}</updated>
  <entry>
    <title>Atom 첫 번째 글</title>
    <link href="https://atomfeed.com/entry1"/>
    <id>https://atomfeed.com/entry1</id>
    <published>${new Date().toISOString()}</published>
    <updated>${new Date().toISOString()}</updated>
    <summary>Atom 첫 번째 글 요약</summary>
    <content>Atom 첫 번째 글 내용</content>
  </entry>
  <entry>
    <title>&middot; Atom 특수문자 제목 &nbsp;</title>
    <link href="https://atomfeed.com/entry2"/>
    <id>https://atomfeed.com/entry2</id>
    <published>${new Date().toISOString()}</published>
    <updated>${new Date().toISOString()}</updated>
    <summary>Atom 두 번째 글 요약</summary>
  </entry>
</feed>`;

// 잘못된 형식의 XML 데이터
const INVALID_XML = `<?xml version="1.0"?>
<invalid>
  <data>이것은 RSS도 Atom도 아닙니다</data>
</invalid>`;

// 테스트용 RssObj
const MOCK_RSS_OBJ: RssObj = {
  id: 1,
  blogName: '테스트 블로그',
  blogPlatform: 'etc',
  rssUrl: 'https://testblog.com/rss',
};

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

    // getThumbnailUrl 메서드 응답 모킹킹
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: () =>
        Promise.resolve(
          '<html><head><meta property="og:image" content="https://example.com/image.jpg"></head></html>',
        ),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
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
        // Mock the time filter to include all feeds
        jest.spyOn(Date.prototype, 'setSeconds').mockReturnValue(Date.now());

        const rawFeeds = rss20Parser['extractRawFeeds'](RSS_20_SAMPLE);

        expect(rawFeeds).toHaveLength(2);
        expect(rawFeeds[0]).toMatchObject({
          title: '첫 번째 글제목',
          link: 'https://testblog.com/post1',
          description: expect.any(String),
        });
        expect(rawFeeds[1]).toMatchObject({
          title: '· 특수문자 제목  ',
          link: 'https://testblog.com/post2',
        });
      });

      it('content:encoded가 있을 때 description보다 우선해야 한다', () => {
        const rawFeeds = rss20Parser['extractRawFeeds'](RSS_20_SAMPLE);

        // content:encoded가 사용되는지 확인 (CDATA 제거된 내용)
        expect(rawFeeds[0].description).toContain('첫 번째 글 내용입니다');
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
        console.log(rawFeeds);

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
      beforeEach(() => {
        // Mock fetch for RSS URL
        (global.fetch as jest.Mock)
          .mockResolvedValueOnce({
            ok: true,
            text: () => Promise.resolve(RSS_20_SAMPLE),
          })
          .mockResolvedValue({
            ok: true,
            text: () =>
              Promise.resolve(
                '<html><head><meta property="og:image" content="https://example.com/image.jpg"></head></html>',
              ),
          });
      });

      it('RSS 피드를 성공적으로 파싱해야 한다', async () => {
        const result = await feedParserManager.fetchAndParse(MOCK_RSS_OBJ);
        expect(Array.isArray(result)).toBe(true);
        expect(global.fetch).toHaveBeenCalledWith(
          MOCK_RSS_OBJ.rssUrl,
          expect.objectContaining({
            headers: expect.objectContaining({
              Accept:
                'application/rss+xml, application/xml, text/xml, application/atom+xml',
            }),
          }),
        );
      });
    });
  });
});
