import 'reflect-metadata';
import { ParserUtil } from '../../src/common/parser/utils/parser-util';
import { Rss20Parser } from '../../src/common/parser/formats/rss20-parser';
import { Atom10Parser } from '../../src/common/parser/formats/atom10-parser';
import { FeedParserManager } from '../../src/common/parser/feed-parser-manager';
import { RssObj } from '../../src/common/types';

const RSS_20_SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>테스트 블로그</title>
    <description>테스트용 블로그입니다</description>
    <link>https://rssfeed.com</link>
    <item>
      <title>첫 번째 글제목</title>
      <description>첫 번째 글 내용입니다.</description>
      <content:encoded><![CDATA[<p>첫 번째 글 내용입니다.</p>]]></content:encoded>
      <link>https://rssfeed.com/post1</link>
      <pubDate>${new Date().toUTCString()}</pubDate>
    </item>
    <item>
      <title>&middot; 특수문자 제목 &nbsp;</title>
      <description>두 번째 글 내용입니다.</description>
      <link>https://rssfeed.com/post2</link>
      <pubDate>${new Date().toUTCString()}</pubDate>
    </item>
  </channel>
</rss>`;

// Atom 1.0 예제 데이터
const ATOM_10_SAMPLE = `<feed xmlns="http://www.w3.org/2005/Atom">
<id>https://rdyjun.github.io/</id>
<title>Junby Log</title>
<subtitle>A minimal, responsive and feature-rich Jekyll theme for technical writing.</subtitle>
<updated>2025-07-30T17:34:08+09:00</updated>
<author>
<name>SungJun Joo</name>
<uri>https://rdyjun.github.io/</uri>
</author>
<link rel="self" type="application/atom+xml" href="https://rdyjun.github.io/feed.xml"/>
<link rel="alternate" type="text/html" hreflang="en" href="https://rdyjun.github.io/"/>
<generator uri="https://jekyllrb.com/" version="4.4.1">Jekyll</generator>
<rights> © 2025 SungJun Joo </rights>
<icon>/assets/img/favicons/favicon.ico</icon>
<logo>/assets/img/favicons/favicon-96x96.png</logo>
<entry>
<title>개인 도메인으로 무료 메일 보내기</title>
<link href="https://rdyjun.github.io/posts/email-smtp-by-domain/" rel="alternate" type="text/html" title="개인 도메인으로 무료 메일 보내기"/>
<published>2025-07-30T17:30:00+09:00</published>
<updated>2025-07-30T17:30:00+09:00</updated>
<id>https://rdyjun.github.io/posts/email-smtp-by-domain/</id>
<content src="https://rdyjun.github.io/posts/email-smtp-by-domain/"/>
<author>
<name>rdyjun</name>
</author>
<category term="smtp"/>
<summary> 회원 가입 과정에서 이메일 인증이 필요하며 이를 백엔드 서버에서 요청을 받아 인증 메일을 보내도록 할 것이다. 인증 메일은 서비스 운영 중 실제 사용자에게 보내질 메일이기 때문에 개인 메일로 보내지 않고, 사용중인 도메인으로 메일을 보낼 계획이다. 본 글은 도메인의 네임서버가 Cloudflare인 환경에서의 과정이다. 무료로 도메인으로 이메일을 보낼 수 있는 서비스는 다음의 스마트워크가 있었다. 스마트워크는 다음 계정이 있는 경우 이 계정에 도메인을 연결해서 쓸 수 있는 구조다. 스마트워크 등록 다음(Daum) 메일에 들어가서 좌측 하단에 스마트워크를 클릭해준다. 그러면 서비스 신청 화면이 나오는데, 여기서 본인의 보유 도메인을 넣어주면 된다. 다음 단계로 넘어가서 기업/단체명을 작... </summary>
</entry>
<entry>
<title>QueryDSL 충돌</title>
<link href="https://rdyjun.github.io/posts/querydsl-crash/" rel="alternate" type="text/html" title="QueryDSL 충돌"/>
<published>2025-07-15T17:55:00+09:00</published>
<updated>2025-07-15T17:55:00+09:00</updated>
<id>https://rdyjun.github.io/posts/querydsl-crash/</id>
<content src="https://rdyjun.github.io/posts/querydsl-crash/"/>
<author>
<name>rdyjun</name>
</author>
<category term="database"/>
<summary> 참고 사이트 https://castle-of-gyu.tistory.com/87 https://github.com/querydsl/querydsl/issues/3428 문제 정의 QueryDSL을 사용해서 각 행으로 분리된 권한 데이터를 List로 합치는 과정에서 아래와 같은 문제에 직면했다. 예를 들어, 아래와 같이 테이블이 있을 경우 권한 부분을 합쳐서 가져온다. 게시글ID 권한 1 USER 1 CUSTOMER { ID: 1, Role: [USER, CUSTOMER] } ... </summary>
</entry>`;

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
  rssUrl: 'https://denamu.site/rss',
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

        it('정상적인 feedDetail을 반환해야 한다.', async () => {
          const result = await feedParserManager.fetchAndParse(MOCK_RSS_OBJ);

          expect(result[0]).toMatchObject({
            blogId: MOCK_RSS_OBJ.id,
            blogName: MOCK_RSS_OBJ.blogName,
            blogPlatform: MOCK_RSS_OBJ.blogPlatform,
            title: '첫 번째 글제목',
            link: expect.stringContaining('https://rssfeed.com/post1'),
            imageUrl: 'https://example.com/image.jpg',
            content: expect.any(String),
            summary: expect.any(String),
            deathCount: 0,
          });
        });
      });

      describe('Atom 1.0 피드', () => {
        beforeEach(() => {
          (global.fetch as jest.Mock)
            .mockResolvedValueOnce({
              ok: true,
              text: () => Promise.resolve(ATOM_10_SAMPLE),
            })
            .mockResolvedValue({
              ok: true,
              text: () =>
                Promise.resolve(
                  '<html><head><meta property="og:image" content="https://example.com/image.jpg"></head></html>',
                ),
            });
        });

        it('정상적인 feedDetail을 반환해야 한다.', async () => {
          const result = await feedParserManager.fetchAndParse(MOCK_RSS_OBJ);

          expect(result[0]).toMatchObject({
            blogId: MOCK_RSS_OBJ.id,
            blogName: MOCK_RSS_OBJ.blogName,
            blogPlatform: MOCK_RSS_OBJ.blogPlatform,
            title: 'Atom 첫 번째 글',
            link: expect.stringContaining('https://atomfeed.com/entry1'),
            imageUrl: 'https://example.com/image.jpg',
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
        // Mock the time filter to include all feeds
        jest.spyOn(Date.prototype, 'setSeconds').mockReturnValue(Date.now());

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
