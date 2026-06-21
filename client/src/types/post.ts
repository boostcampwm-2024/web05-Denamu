import { ApiData } from "@/types/api";

export interface FeedBase {
  id: number;
  createdAt: string;
  title: string;
  viewCount: number;
  path: string;
  author: string;
  thumbnail: string;
  authorImageUrl?: string;
  tag: string[];
  likes: number;
  blogPlatform: string;
  isNew?: boolean;
}

export type FeedList = FeedBase;

export interface FeedDetail extends FeedBase {
  summary: string;
  isOwner: boolean;
}

export interface InfiniteScrollResponse<T> {
  result: T[];
  hasMore: boolean;
  lastId: number | null;
}

export type LatestFeedsApiResponse = ApiData<InfiniteScrollResponse<FeedList>>;

export type TrendingFeedsApiResponse = ApiData<FeedList[]>;

export type FeedDetailType = ApiData<FeedDetail>;

export interface FeedCommentType {
  id: number;
  comment: string;
  parentId: number | null;
  isDeleted: boolean;
  date: string;
  user: {
    id: number;
    userName: string;
    profileImage: string | null;
  };
}

export interface RecentFeedsApiResponse {
  message: string;
  data: FeedList[];
}
