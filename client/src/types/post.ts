export interface Post {
  id: number;
  createdAt: string;
  title: string;
  viewCount: number;
  path: string;
  author: string;
  thumbnail: string;
  authorImageUrl?: string;
  tag: string[];
  likes?: number;
  blogPlatform: string;
  summary: string;
}

export interface LatestPostsApiResponse {
  message: string;
  data: {
    result: Post[];
    hasMore: boolean;
    lastId: number | null;
  };
}

export interface TrendingPostsApiResponse {
  message: string;
  data: Post[];
}

export interface InfiniteScrollResponse<T> {
  result: T[];
  hasMore: boolean;
  lastId: number | null;
}

export interface PostDetailType {
  message: string;
  data: Post;
}
