export interface RssObj {
  id: number;
  rssUrl: string;
  blogName: string;
  blogPlatform: string;
  blogImage: string | null;
}

export interface FeedFetchResult {
  feeds: FeedDetail[];
  rssObj: RssObj;
}

export interface FeedDetail {
  id: number;
  blogId: number;
  pubDate: string;
  title: string;
  link: string;
  thumbnail: string;
  content?: string;
  summary?: string;
  tag?: string[];
  deathCount?: number;
}
