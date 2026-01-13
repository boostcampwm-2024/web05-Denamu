import { RssObj } from '@common/types';

/**
 * Parser 테스트용 픽스처 데이터
 */

// test시에는 필터링 하는 시간대가 매우 광범위하기에, 시간대를 신경 쓸 필요없음.
export const FIXED_DATE = new Date();
const FIXED_DATE_UTC = FIXED_DATE.toUTCString();
const FIXED_DATE_ISO = FIXED_DATE.toISOString();

// RSS 2.0 예제 데이터
export const RSS_20_SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
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
      <pubDate>${FIXED_DATE_UTC}</pubDate>
    </item>
    <item>
      <title>&middot; 특수문자 제목 &nbsp;</title>
      <description>두 번째 글 내용입니다.</description>
      <link>https://rssfeed.com/post2</link>
      <pubDate>${FIXED_DATE_UTC}</pubDate>
    </item>
  </channel>
</rss>`;

// Atom 1.0 예제 데이터
export const ATOM_10_SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>테스트 Atom 피드</title>
  <link href="https://atomfeed.com"/>
  <id>https://atomfeed.com</id>
  <updated>${FIXED_DATE_ISO}</updated>
  <entry>
    <title>Atom 첫 번째 글</title>
    <link rel="alternate" href="https://atomfeed.com/entry1"/>
    <id>https://atomfeed.com/entry1</id>
    <published>${FIXED_DATE_ISO}</published>
    <updated>${FIXED_DATE_ISO}</updated>
    <summary>Atom 첫 번째 글 요약</summary>
    <content>Atom 첫 번째 글 내용</content>
  </entry>
  <entry>
    <title>&middot; Atom 특수문자 제목 &nbsp;</title>
    <link rel="alternate" href="https://atomfeed.com/entry2"/>
    <id>https://atomfeed.com/entry2</id>
    <published>${FIXED_DATE_ISO}</published>
    <updated>${FIXED_DATE_ISO}</updated>
    <summary>Atom 두 번째 글 요약</summary>
  </entry>
</feed>`;

// 잘못된 형식의 XML 데이터
export const INVALID_XML = `<?xml version="1.0"?>
<invalid>
  <data>이것은 RSS도 Atom도 아닙니다</data>
</invalid>`;

// 테스트용 RssObj
export const MOCK_RSS_OBJ: RssObj = {
  id: 1,
  blogName: '테스트 블로그',
  blogPlatform: 'etc',
  rssUrl: 'https://denamu.dev/rss',
};
