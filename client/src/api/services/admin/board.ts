import { BOARD } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";
import { ApiData } from "@/types/api";
import {
  BoardCategory,
  CreateBoardPayload,
  BoardDetail,
  BoardPage,
  BoardStatus,
  BoardSummary,
  UpdateBoardPayload,
} from "@/types/board";

export interface GetAdminBoardsParams {
  page?: number;
  limit?: number;
  status?: BoardStatus;
  category?: BoardCategory;
}

export const adminBoard = {
  getList: async (params: GetAdminBoardsParams): Promise<BoardPage<BoardSummary>> => {
    const response = await axiosInstance.get<ApiData<BoardPage<BoardSummary>>>(BOARD.ADMIN_LIST, { params });
    return response.data.data;
  },
  getDetail: async (id: number): Promise<BoardDetail> => {
    const response = await axiosInstance.get<ApiData<BoardDetail>>(BOARD.ADMIN_DETAIL(id));
    return response.data.data;
  },
  create: async (payload: CreateBoardPayload): Promise<BoardDetail> => {
    const response = await axiosInstance.post<ApiData<BoardDetail>>(BOARD.ADMIN_LIST, payload);
    return response.data.data;
  },
  update: async (id: number, payload: UpdateBoardPayload): Promise<BoardDetail> => {
    const response = await axiosInstance.patch<ApiData<BoardDetail>>(BOARD.ADMIN_DETAIL(id), payload);
    return response.data.data;
  },
  remove: async (id: number): Promise<void> => {
    await axiosInstance.delete(BOARD.ADMIN_DETAIL(id));
  },
};
