import { TAG } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";
import { CategoryTags, TagListResponse } from "@/types/tag";

export const tags = {
  list: async (): Promise<CategoryTags[]> => {
    const response = await axiosInstance.get<TagListResponse>(TAG.LIST);
    return response.data.data;
  },
};
