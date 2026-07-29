import { BOARD } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";
import { ApiData } from "@/types/api";
import { BoardDetail, BoardPage, BoardSummary } from "@/types/board";

export interface GetBoardsParams {
  page?: number;
  limit?: number;
}

export const getBoards = async (params: GetBoardsParams): Promise<BoardPage<BoardSummary>> => {
  const response = await axiosInstance.get<ApiData<BoardPage<BoardSummary>>>(BOARD.LIST, { params });
  return response.data.data;
};

export const getBoard = async (id: number): Promise<BoardDetail> => {
  const response = await axiosInstance.get<ApiData<BoardDetail>>(BOARD.DETAIL(id));
  return response.data.data;
};
