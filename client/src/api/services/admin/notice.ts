import { NOTICE } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";
import { ApiData } from "@/types/api";
import {
  CreateNoticePayload,
  NoticeDetail,
  NoticePage,
  NoticeStatus,
  NoticeSummary,
  UpdateNoticePayload,
} from "@/types/notice";

export interface GetAdminNoticesParams {
  page?: number;
  limit?: number;
  status?: NoticeStatus;
}

export const adminNotice = {
  getList: async (params: GetAdminNoticesParams): Promise<NoticePage<NoticeSummary>> => {
    const response = await axiosInstance.get<ApiData<NoticePage<NoticeSummary>>>(NOTICE.ADMIN_LIST, { params });
    return response.data.data;
  },
  getDetail: async (id: number): Promise<NoticeDetail> => {
    const response = await axiosInstance.get<ApiData<NoticeDetail>>(NOTICE.ADMIN_DETAIL(id));
    return response.data.data;
  },
  create: async (payload: CreateNoticePayload): Promise<NoticeDetail> => {
    const response = await axiosInstance.post<ApiData<NoticeDetail>>(NOTICE.ADMIN_LIST, payload);
    return response.data.data;
  },
  update: async (id: number, payload: UpdateNoticePayload): Promise<NoticeDetail> => {
    const response = await axiosInstance.patch<ApiData<NoticeDetail>>(NOTICE.ADMIN_DETAIL(id), payload);
    return response.data.data;
  },
  remove: async (id: number): Promise<void> => {
    await axiosInstance.delete(NOTICE.ADMIN_DETAIL(id));
  },
};
