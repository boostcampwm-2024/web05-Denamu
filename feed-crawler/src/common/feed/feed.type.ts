export interface RssObj {
  id: number;
  rssUrl: string;
  blogName: string;
  blogPlatform: string;
  blogImage: string | null;
}

export interface FeedFetchResult {
  feeds: FeedDetail[];
  channelImage: string | null | undefined;
}

export interface FeedDetail {
  id: number;
  blog: {
    id: number;
    name: string;
    platform: string;
    image: string | null;
  };
  pubDate: string;
  title: string;
  link: string;
  thumbnail: string;
  content?: string;
  summary?: string;
  tag?: string[];
  deathCount?: number;
}
