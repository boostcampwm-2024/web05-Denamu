import { QNA } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";
import { ApiData } from "@/types/api";
import { AnswerQnaPayload, QnaDetail, QnaPage, QnaStatus, QnaSummary } from "@/types/qna";

export interface GetAdminQnaListParams {
  page?: number;
  limit?: number;
  status?: QnaStatus;
}

export const adminQna = {
  getList: async (params: GetAdminQnaListParams): Promise<QnaPage<QnaSummary>> => {
    const response = await axiosInstance.get<ApiData<QnaPage<QnaSummary>>>(QNA.ADMIN_LIST, { params });
    return response.data.data;
  },
  getDetail: async (id: number): Promise<QnaDetail> => {
    const response = await axiosInstance.get<ApiData<QnaDetail>>(QNA.ADMIN_DETAIL(id));
    return response.data.data;
  },
  answer: async (id: number, payload: AnswerQnaPayload): Promise<void> => {
    await axiosInstance.post(QNA.ADMIN_MESSAGES(id), payload);
  },
};
