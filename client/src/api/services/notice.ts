import { NOTICE } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";
import { ApiData } from "@/types/api";
import { NoticeDetail, NoticePage, NoticeSummary } from "@/types/notice";

export interface GetNoticesParams {
  page?: number;
  limit?: number;
}

export const getNotices = async (params: GetNoticesParams): Promise<NoticePage<NoticeSummary>> => {
  const response = await axiosInstance.get<ApiData<NoticePage<NoticeSummary>>>(NOTICE.LIST, { params });
  return response.data.data;
};

export const getNotice = async (id: number): Promise<NoticeDetail> => {
  const response = await axiosInstance.get<ApiData<NoticeDetail>>(NOTICE.DETAIL(id));
  return response.data.data;
};
