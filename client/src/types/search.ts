import { ApiData } from "@/types/api";

export interface SearchResult {
  id: number;
  title: string;
  blog: {
    name: string;
    platform: string;
  };
  path: string;
  createdAt: string;
  thumbnail: string;
  viewCount: number;
  tag: string[];
  likes: number;
  comments: number;
}

export interface SearchData {
  totalCount: number;
  result: SearchResult[];
  totalPages: number;
}

export type SearchResponse = ApiData<SearchData>;
export interface SearchRequest {
  query: string;
  filter: FilterType;
  page: number;
  pageSize: number;
}
export type FilterType = "title" | "blogName" | "all";

export type SearchMode = "feed" | "user" | "rss";

export interface UserSearchResult {
  id: number;
  userName: string;
  profileImage: string | null;
  introduction: string | null;
  blogCount: number;
}

export interface UserSearchData {
  totalCount: number;
  result: UserSearchResult[];
  totalPages: number;
}

export type UserSearchResponse = ApiData<UserSearchData>;

export interface UserSearchRequest {
  query: string;
  page: number;
  pageSize: number;
}

export interface RssSearchResult {
  id: number;
  name: string;
  blogPlatform: string;
  blogImage: string | null;
}

export interface RssSearchData {
  totalCount: number;
  result: RssSearchResult[];
  totalPages: number;
}

export type RssSearchResponse = ApiData<RssSearchData>;

export interface RssSearchRequest {
  query: string;
  page: number;
  pageSize: number;
}
