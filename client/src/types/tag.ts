import { ApiData } from "@/types/api";

export interface CategoryTags {
  category: string;
  tags: string[];
}

export type TagListResponse = ApiData<CategoryTags[]>;
