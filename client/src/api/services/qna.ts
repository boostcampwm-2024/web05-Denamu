import { QNA } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";
import { ApiData } from "@/types/api";
import {
  AddQnaMessagePayload,
  CreateQnaPayload,
  QnaDetail,
  QnaPage,
  QnaSummary,
  VerifyQnaPasswordPayload,
} from "@/types/qna";

export interface GetQnaListParams {
  page?: number;
  limit?: number;
}

export const getQnaList = async (params: GetQnaListParams): Promise<QnaPage<QnaSummary>> => {
  const response = await axiosInstance.get<ApiData<QnaPage<QnaSummary>>>(QNA.LIST, { params });
  return response.data.data;
};

export const getQna = async (id: number): Promise<QnaDetail> => {
  const response = await axiosInstance.get<ApiData<QnaDetail>>(QNA.DETAIL(id));
  return response.data.data;
};

export const createQna = async (payload: CreateQnaPayload): Promise<{ id: number }> => {
  const response = await axiosInstance.post<ApiData<{ id: number }>>(QNA.LIST, payload);
  return response.data.data;
};

export const verifyQnaPassword = async (
  id: number,
  payload: VerifyQnaPasswordPayload
): Promise<QnaDetail> => {
  const response = await axiosInstance.post<ApiData<QnaDetail>>(QNA.VERIFY(id), payload);
  return response.data.data;
};

export const addQnaMessage = async (id: number, payload: AddQnaMessagePayload): Promise<void> => {
  await axiosInstance.post(QNA.MESSAGES(id), payload);
};
