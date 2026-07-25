import { blogUrlToRss } from '@rss/util/blogUrlToRss';

describe(`${blogUrlToRss.name} Unit Test`, () => {
  it.each([
    ['tistory', 'https://myblog.tistory.com', 'https://myblog.tistory.com/rss'],
    ['velog', 'https://velog.io/@seok3765', 'https://v2.velog.io/rss/@seok3765'],
    ['medium', 'https://medium.com/@seok3765', 'https://medium.com/feed/@seok3765'],
    ['github', 'https://seok3765.github.io', 'https://seok3765.github.io/feed.xml'],
    [
      'naver',
      'https://blog.naver.com/seok3765',
      'https://rss.blog.naver.com/seok3765',
    ],
  ] as const)(
    '%s 플랫폼의 블로그 주소 %s를 RSS 주소 %s로 변환한다.',
    (blogPlatform, blogUrl, expected) => {
      expect(blogUrlToRss(blogPlatform, blogUrl)).toBe(expected);
    },
  );
});
