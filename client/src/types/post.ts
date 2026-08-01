import { ApiData } from "@/types/api";

export interface FeedBase {
  id: number;
  createdAt: string;
  title: string;
  viewCount: number;
  path: string;
  author: string;
  thumbnail: string;
  tag: string[];
  likes: number;
  comments: number;
  blog: {
    platform: string;
    image?: string | null;
  };
  isNew?: boolean;
}

export type FeedList = FeedBase;

export interface FeedDetail extends Omit<FeedBase, "blog"> {
  summary: string;
  isOwner: boolean;
  blog: {
    id: number;
    ownerName: string | null;
    isOwnerCertified: boolean;
    platform: string;
    image: string | null;
  };
  isSubscribed: boolean;
  isBlocked: boolean;
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

export interface NoSummaryFeed {
  id: number;
  title: string;
  likes: number;
  comments: number;
}

export type NoSummaryFeedsApiResponse = ApiData<NoSummaryFeed[]>;

export interface RecentFeedsApiResponse {
  message: string;
  data: FeedList[];
}
