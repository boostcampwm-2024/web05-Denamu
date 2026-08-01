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
  blogId: number;
  blogName: string;
  blogPlatform: string;
  blogImage: string | null;
  pubDate: string;
  title: string;
  link: string;
  imageUrl: string;
  content?: string;
  summary?: string;
  tag?: string[];
  deathCount?: number;
}

export interface FullFeedCrawlMessage {
  rssId: number;
  timestamp: number;
  deathCount: number;
}
