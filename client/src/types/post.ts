import { ApiData } from "@/types/api";

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

export interface InfiniteScrollResponse<T> {
  result: T[];
  hasMore: boolean;
  lastId: number | null;
}

export type LatestPostsApiResponse = ApiData<InfiniteScrollResponse<Post>>;

export type TrendingPostsApiResponse = ApiData<Post[]>;

export type PostDetailType = ApiData<Post>;

export interface PostCommentType {
  id: number;
  author: string;
  content: string;
  authorImage: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
}
