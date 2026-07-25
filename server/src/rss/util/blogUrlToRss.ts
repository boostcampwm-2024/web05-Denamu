export const BLOG_PLATFORMS = [
  'tistory',
  'velog',
  'medium',
  'github',
  'naver',
  'etc',
] as const;

export type BlogPlatform = (typeof BLOG_PLATFORMS)[number];

export type KnownBlogPlatform = Exclude<BlogPlatform, 'etc'>;

function normalizeUrl(url: string){
  const trimmed = url.trim();
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
};

export function blogUrlToRss(
  blogPlatform: KnownBlogPlatform,
  blogUrl: string,
){
  const cleanUrl = normalizeUrl(blogUrl);
  const urlObj = new URL(cleanUrl);

  switch (blogPlatform) {
    case 'tistory':
      return `${urlObj.protocol}//${urlObj.hostname}/rss`;
    case 'velog': {
      const username = urlObj.pathname.replace(/^\/@/, '').split('/')[0];
      return `https://v2.velog.io/rss/@${username}`;
    }
    case 'medium': {
      const username = urlObj.pathname.replace(/^\/@/, '').split('/')[0];
      return `https://medium.com/feed/@${username}`;
    }
    case 'github':
      return `${urlObj.protocol}//${urlObj.hostname}/feed.xml`;
    case 'naver': {
      const blogId = urlObj.pathname.replace(/^\//, '').split('/')[0];
      return `https://rss.blog.naver.com/${blogId}`;
    }
  }
};
