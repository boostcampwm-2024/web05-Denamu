export interface FeedRecentRedisRecord {
  id: number;
  blogPlatform: string;
  blogImage: string;
  createdAt: string;
  viewCount: number;
  blogName: string;
  thumbnail: string;
  path: string;
  title: string;
  tagList: string[];
  likes: number;
  comments: number;
}

export interface FeedAiQueueMessage {
  id: number;
  content?: string;
  deathCount?: number;
}
