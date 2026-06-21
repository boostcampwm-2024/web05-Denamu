import { SEARCH } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";
import { SearchRequest, SearchResponse, UserSearchRequest, UserSearchResponse } from "@/types/search";

export const getSearch = async (data: SearchRequest): Promise<SearchResponse> => {
  const response = await axiosInstance.get<SearchResponse>(SEARCH.GET_RESULT, {
    params: {
      find: data.query,
      type: data.filter,
      page: data.page,
      limit: data.pageSize,
    },
  });
  return response.data;
};

export const getUserSearch = async (data: UserSearchRequest): Promise<UserSearchResponse> => {
  const response = await axiosInstance.get<UserSearchResponse>(SEARCH.GET_USER_RESULT, {
    params: {
      find: data.query,
      page: data.page,
      limit: data.pageSize,
    },
  });
  return response.data;
};
