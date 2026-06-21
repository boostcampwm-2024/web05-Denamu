import { ApiData } from "@/types/api";

export interface SearchResult {
  id: number;
  title: string;
  blogName: string;
  path: string;
  createdAt: string;
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

export type SearchMode = "feed" | "user";

export interface UserSearchResult {
  id: number;
  userName: string;
  profileImage: string | null;
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
