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
  isNew?: boolean;
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
  comment: string;
  date: string;
  user: {
    id: number;
    userName: string;
    profileImage: string | null;
  };
}

export interface UpdatePostsApiResponse {
  message: string;
  data: Post[];
}
