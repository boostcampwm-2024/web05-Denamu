const DEFAULT_OG_TITLE = 'Denamu';
const DEFAULT_OG_DESCRIPTION = '개발자들의 블로그 허브 데나무';
const DEFAULT_OG_IMAGE = 'https://denamu.dev/files/Denamu_Logo_KOR.png';
const SITE_URL = 'https://denamu.dev';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderDefaultOgHtml(): string {
  return renderOgHtml({
    title: DEFAULT_OG_TITLE,
    description: DEFAULT_OG_DESCRIPTION,
    image: DEFAULT_OG_IMAGE,
    url: SITE_URL,
    type: 'website',
    twitterCard: 'summary',
  });
}

export function renderFeedOgHtml(feed: {
  feedId: number;
  title: string;
  summary: string | null;
  thumbnail: string | null;
}): string {
  return renderOgHtml({
    title: `Denamu - ${feed.title}`,
    description: feed.summary ?? DEFAULT_OG_DESCRIPTION,
    image: feed.thumbnail ?? DEFAULT_OG_IMAGE,
    url: `${SITE_URL}/${feed.feedId}`,
    type: 'article',
    twitterCard: 'summary_large_image',
  });
}

export function renderProfileOgHtml(profile: {
  userId: number;
  userName: string;
  introduction: string | null;
  profileImage: string | null;
}): string {
  return renderOgHtml({
    title: `Denamu - ${profile.userName}`,
    description: profile.introduction ?? DEFAULT_OG_DESCRIPTION,
    image: profile.profileImage ?? DEFAULT_OG_IMAGE,
    url: `${SITE_URL}/profile/${profile.userId}`,
    type: 'profile',
    twitterCard: 'summary',
  });
}

export function renderRssOgHtml(rss: {
  rssId: number;
  name: string;
  blogImage: string | null;
}): string {
  return renderOgHtml({
    title: `Denamu - ${rss.name}`,
    description: DEFAULT_OG_DESCRIPTION,
    image: rss.blogImage ?? DEFAULT_OG_IMAGE,
    url: `${SITE_URL}/rss/${rss.rssId}`,
    type: 'website',
    twitterCard: 'summary',
  });
}

function renderOgHtml(params: {
  title: string;
  description: string;
  image: string;
  url: string;
  type: string;
  twitterCard: 'summary' | 'summary_large_image';
}): string {
  const title = escapeHtml(params.title);
  const description = escapeHtml(params.description);
  const image = escapeHtml(params.image);
  const url = escapeHtml(params.url);
  const type = escapeHtml(params.type);

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<title>${title}</title>
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${image}" />
<meta property="og:url" content="${url}" />
<meta property="og:type" content="${type}" />
<meta name="twitter:card" content="${params.twitterCard}" />
<link rel="canonical" href="${url}" />
</head>
<body></body>
</html>
`;
}
